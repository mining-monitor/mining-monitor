using System;
using System.Linq;

namespace MiningMonitor.BusinessLogic
{
    public static class Log
    {
        private static string[] _items = Array.Empty<string>();

        public static void Add(string message)
        {
            message = $"{DateTime.Now} - {message}";
            
            _items = new[] {message}
                .Concat(_items)
                .Take(100)
                .ToArray();
            
            Console.WriteLine(message);
        }

        public static string[] Get() => _items;
    }
}