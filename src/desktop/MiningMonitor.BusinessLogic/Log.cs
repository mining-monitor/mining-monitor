using System;
using System.Linq;

namespace MiningMonitor.BusinessLogic
{
    public static class Log
    {
        private static string[] _items = Array.Empty<string>();

        public static void Add(string message)
        {
            _items = new[] {$"{DateTime.Now} - {message}"}
                .Concat(_items)
                .Take(100)
                .ToArray();
        }

        public static string[] Get() => _items;
    }
}