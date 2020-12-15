static void Main(string[] args)
{
    int[] C = new int[2];

    int res;
                
    for (int j = 500000000; j > 0; j--)
    { 
        C[0]++; 
        C[0]++;
    }
    C[1] = C[0];
    Console.WriteLine(C[0]);
}