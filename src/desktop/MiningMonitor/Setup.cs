using MiningMonitor.BusinessLogic;
using Squirrel;

namespace MiningMonitor
{
    public static class Setup
    {
        private static readonly string UpdateUrl = "https://mining-monitor.github.io/mining-monitor/desktop";
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

            LogCurrentVersion();
        }

        public static void Close()
        {
            _cancelTokenSource!.Cancel();
        }

        public static string GetCurrentVersion()
        {
            const string app = "app-";

            try
            {
                var directory = new DirectoryInfo(Environment.CurrentDirectory).Name;
                if (!directory.StartsWith(app))
                {
                    return "";
                }

                return $"v{directory.Substring(app.Length)}";
            }
            catch (Exception e)
            {
                Log.Add(e.Message);
                return "";
            }
        }

        private static void LogCurrentVersion()
        {
            var version = GetCurrentVersion();

            if (!string.IsNullOrEmpty(version))
            {
                Log.Add($"Версия приложения {version}");
            }
        }

        private static async Task Update()
        {
            while (true)
            {
                try
                {
                    using var mgr = new UpdateManager(UpdateUrl);
                    var newVersion = await mgr.UpdateApp();

                    if (newVersion != null)
                    {
                        UpdateManager.RestartApp();
                    }
                }
                finally
                {
                    await Task.Delay(TimeSpan.FromMinutes(1), _cancellationToken);
                }
            }
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