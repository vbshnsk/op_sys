package allocator

import (
	"errors"
	"fmt"
	"syscall"
	"unsafe"
)

const capacity = 255

/**
	Структура заголовка:
	next: указатель на следующий заголовок
	mem: указатель на память, что описана этим заголовком
	free: кол-во свободных байт в памяти, на которую указывает заголовок
	size: кол-во занятых байт в памяти, на которую указывает заголовок
 */
type header struct {
	next *header
	mem *byte
	free uint8
	size uint8
}

/**
	Дополнительный тип для вывода в консоль данных про память:
	MemTaken: сколько байт памяти занято
	Blocks: сколько блоков (заголовков) выделено
	MemMap: матрица заполненности памяти
 */
type Stats struct {
	MemTaken uint8
	Blocks uint8
	MemMap [8][32]bool
}

/**
	Основная структура, отвечающая за работу с памятью:
	initialized: чек для проверки был ли инициализирован аллокатор
	memory: сама область памяти, которая была выделена для аллокации
	header: ссылка на заголовок в голове памяти
	freeBlocks: все указатели на заголовки со свободной памятью
 */
type Allocator struct {
	initialized bool
	memory []byte
	header *header
	freeBlocks []*header
}

/**
	Инициализация аллокатора
 */
func (a *Allocator) Initialize ()  {
	if a.initialized { return }
	a.initialized = true

	// Выделение памяти для работы через системный вызов
	var mem, _ =
		syscall.Mmap(-1, 0, capacity, syscall.PROT_READ | syscall.PROT_WRITE, syscall.MAP_PRIVATE | syscall.MAP_ANONYMOUS)
	a.memory = mem

	// Создание заголовка в голове памяти
	a.header = &header{
		mem:  &mem[0],
		next: nil,
		free: capacity,
		size: 0,
	}
	a.freeBlocks = append(a.freeBlocks, a.header)
}

/**
	Аллокация памяти:
	size: размер желаемого блока
 */
func (a *Allocator) Allocate (size uint8) (*interface{}, error) {
	var block *header

	// выравниваем размер блока памяти
	size += size % 4

	// ищем подходящий блок среди пула свободніх блоков
	for i, currentBlock := range a.freeBlocks {
		if currentBlock != nil && currentBlock.free > size {
			block = currentBlock
			copy(a.freeBlocks[i:], a.freeBlocks[i+1:])
			a.freeBlocks[len(a.freeBlocks) - 1] = nil
			a.freeBlocks = a.freeBlocks[:len(a.freeBlocks) - 1]
			break
		}
	}

	// если не нашли, то возвращаем ошибку аллокации
	if block == nil { return nil, errors.New("error allocating memory") }

	// заниаем блок памяти
	block.size = size

	// если текущий блок памяти - крайний, создаем заголовок для следующего блока крайним
	if block.next == nil {
		block.next = &header{
			mem: (*byte) (unsafe.Pointer((uintptr)(unsafe.Pointer(block.mem)) + (uintptr)(block.size))),
			next: nil,
			free: block.free - size,
			size: 0,
		}
	}

	// в случае если блок не крайний, но не вся память была занята, следующим поставить заголовок на оставшуюся память
	if block.free - size != 0 {
		var prevNext = block.next
		block.next = &header{
			mem: (*byte) (unsafe.Pointer((uintptr)(unsafe.Pointer(block.mem)) + (uintptr)(block.size))),
			next: prevNext,
			free: block.free - size,
			size: 0,
		}
	}
	block.free = 0
	if block.next.free > 0 {
		a.freeBlocks = append(a.freeBlocks, block.next)
	}
	return (*interface{})(unsafe.Pointer(block.mem)), nil
}

/**
	Вспомогательная функция для очистки блока памяти
 */
func (a *Allocator) freeMem (hdr *header) {
	// изменяем значения памяти, чтобы пометить что она свободна
	hdr.free = hdr.size
	hdr.size = 0

	// добавляем блок в пул свободных
	a.freeBlocks = append([]*header{hdr}, a.freeBlocks...)

	// по возможности мерджим с последующими блоками в один
	hdr.mergeWithNext()
}

/**
	Основная функция освобождения блока памяти
 */
func (a *Allocator) FreeBlock (ptr *interface{}) error {
	// ищем укзатель на блок по указателю на память
	var memHead, err = a.findHeader(ptr)

	//освобождаем блок если нашли его
	if err != nil { return err }
	a.freeMem(memHead)
	return nil
}

/**
	Вспомогательная функция для мерджа свободных блоков
 */
func (header *header) mergeWithNext () {
	// пока последующий блок свободный, мерджим его с предыдущим
	for {
		if header.next != nil && header.next.free > 0 {
			header.free = header.free + header.next.free
			header.next = header.next.next
		} else { break }
	}
}

/**
	Функция, которая возвращает статистику по занятой памяти
 */
func (a *Allocator) GetStats () Stats {
	var header = a.header
	var usedMem = (uint8)(0)
	var blocks = 0
	var memoryMap [8][32]bool
	var i, j = 0, 0
	for {
		var blockMem = header.size
		for blockMem != 0 {
			memoryMap[i][j] = true
			blockMem--
			j++
			if j == 32 {
				j = 0
				i++
			}
		}
		var blockFree = header.free
		for blockFree != 0 {
			memoryMap[i][j] = false
			blockFree--
			j++
			if j == 32 {
				j = 0
				i++
			}
		}
		usedMem += header.size
		blocks++
		if header.next == nil {
			return Stats{
				usedMem,
				(uint8)(blocks),
				memoryMap,
			}
		}
		header = header.next
	}
}

/**
	Вывод статистики по памяти
 */
func (s Stats) Print() {
	fmt.Printf("Memory used: %.2f perecent. Blocks: %v.\nMemory map:\n",
		(float64)(s.MemTaken) / 255 * 100, s.Blocks)
	for i := range s.MemMap {
		for j := range s.MemMap[i] {
			var res string
			if s.MemMap[i][j] {
				res = "#"
			} else {
				res = "*"
			}
			fmt.Print(res)
		}
		fmt.Print("\n")
	}
}

/**
	Функция реаллокации памяти
 */
func (a *Allocator) Reallocate(ptr *interface{}, size uint8) (*interface{}, error) {
	// находим  указатель на старый блок, возвращаем старый указатель на память при ошибке
	var oldHeader, findErr = a.findHeader(ptr)
	if findErr != nil {
		return ptr, findErr
	}

	// делаем аллокацию нового блока, возвращаем старый указатель на память при ошибке
	var newPtr, err = a.Allocate(size)
	if err != nil {
		return ptr, err
	}

	// копируем значения в памяти в новую локацию
	for i := uint8(0); i < oldHeader.size; i++ {
		var newPtrDataLocation = (*interface{}) (unsafe.Pointer((uintptr)(unsafe.Pointer(newPtr)) + (uintptr)(i)))
		var oldPtrDataLocation = (*interface{}) (unsafe.Pointer((uintptr)(unsafe.Pointer(oldHeader.mem)) + (uintptr)(i)))
		*newPtrDataLocation = *oldPtrDataLocation
	}

	// освобождаем память в старой локации
	a.freeMem(oldHeader)
	return newPtr, nil
}

/**
	Вспомогательная функция для поиска блока по указателю на память
 */
func (a *Allocator) findHeader(ptr *interface{}) (*header, error) {
	// приводим указатель в нужный тип
	var memPtr = (*byte)(unsafe.Pointer(ptr))
	var header = a.header

	// ищем в памяти блок, что ссылается на нужную память, возвращаем указатель на блок памяти или ошибку
	for {
		if header.mem == memPtr {
			return header, nil
		}
		if header.next != nil {
			header = header.next
		} else { return nil, errors.New("error finding pointer") }
	}
}