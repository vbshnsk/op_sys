package main

import (
	"./memory"
)

func main() {
	var a = allocator.Allocator{}
	a.Initialize()
	var count = 0
	var firstPtr *interface{}
	var secondPtr *interface{}
	var thirdPtr *interface{}
	for  {
		count++
		var ptr, _ = a.Allocate(2)
		if count == 1 {
			firstPtr = ptr
		}
		if count == 2 {
			secondPtr = ptr
		}
		if count == 3 {
			thirdPtr = ptr
			break
		}
	}
	a.GetStats().Print()
	firstPtr, _ = a.Reallocate(firstPtr, 8)
	secondPtr, _  = a.Reallocate(secondPtr, 8)
	thirdPtr, _ = a.Reallocate(thirdPtr, 8)
	a.GetStats().Print()
	a.Reallocate(secondPtr, 4)
	a.GetStats().Print()
	a.Reallocate(thirdPtr, 4)
	a.GetStats().Print()

}
