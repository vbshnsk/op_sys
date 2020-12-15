using System;

namespace l5
{
    class Program
    {
        static void Main(string[] args)
        {
            before();
            after();
        }

        static void after()
        {
            var watch = System.Diagnostics.Stopwatch.StartNew();
            int[] C = new int[2];
                
            for (int j = 0; j < 500000000; j++)
            {
                C[0] += 2;
            }
            C[1] = C[0];
            watch.Stop();
            var elapsedMs = watch.ElapsedMilliseconds;
            
            Console.WriteLine($"After: {elapsedMs}ms");            
        }

        static void before()
        {
            var watch = System.Diagnostics.Stopwatch.StartNew();
            int[] C = new int[2];
                
            for (int j = 500000000; j > 0; j--)
            { 
                C[0]++; 
                C[0]++;
            }
            C[1] = C[0];
            
            watch.Stop();
            var elapsedMs = watch.ElapsedMilliseconds;

            Console.WriteLine($"Before: {elapsedMs}ms");
        }
    }
}