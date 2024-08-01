using MiningMonitor.BusinessLogic;
using Squirrel;

namespace MiningMonitor
{
    public static class Updater
    {
        private static readonly string UpdateUrl = Environment.CurrentDirectory;
        private static CancellationTokenSource? _cancelTokenSource;
        private static CancellationToken _cancellationToken;

        public static void Run()
        {
            _cancelTokenSource = new CancellationTokenSource();
            _cancellationToken = _cancelTokenSource.Token;
            Task.Run(Update, _cancellationToken);
        }

        private static async Task Update()
        {
            Log.Add($"Ожидаем обновления в {UpdateUrl}");
            
            while (true)
            {
                try
                {
                    using var mgr = new UpdateManager(UpdateUrl);
                    await mgr.UpdateApp();
                }
#pragma warning disable CS0168
                catch (Exception ex)
#pragma warning restore CS0168
                {
                    // Log.Add(ex.Message);
                }
                finally
                {
                    await Task.Delay(TimeSpan.FromMinutes(1), _cancellationToken);
                }
            }
        }

        public static void Stop()
        {
            _cancelTokenSource!.Cancel();
        }
    }
}