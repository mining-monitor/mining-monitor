using System.Collections.Concurrent;

namespace MiningMonitor
{
    public static class Log
    {
        private static readonly ConcurrentBag<string> Items = new();

        public static void Add(string message) => Items.Add($"{DateTime.Now} - {message}");

        public static string[] Get() => Items.ToArray();
    }
}