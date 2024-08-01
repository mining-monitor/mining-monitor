using MiningMonitor.BusinessLogic;
using Squirrel;

namespace MiningMonitor
{
    public static class Setup
    {
        private static readonly string UpdateUrl = Environment.CurrentDirectory;
        private static CancellationTokenSource? _cancelTokenSource;
        private static CancellationToken _cancellationToken;

        public static void Init()
        {
            SquirrelAwareApp.HandleEvents(
                onInitialInstall: OnAppInstall,
                onAppUninstall: OnAppUninstall,
                onEveryRun: OnAppRun
            );

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

        public static void Close()
        {
            _cancelTokenSource!.Cancel();
        }

        private static void OnAppInstall(SemanticVersion version, IAppTools tools)
        {
            tools.CreateShortcutForThisExe(ShortcutLocation.StartMenu | ShortcutLocation.Desktop);
        }

        private static void OnAppUninstall(SemanticVersion version, IAppTools tools)
        {
            tools.RemoveShortcutForThisExe(ShortcutLocation.StartMenu | ShortcutLocation.Desktop);
        }

        private static void OnAppRun(SemanticVersion version, IAppTools tools, bool firstRun)
        {
            tools.SetProcessAppUserModelId();
        }
    }
}