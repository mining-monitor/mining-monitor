﻿using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace MiningMonitor.BusinessLogic
{
    public static class ServerRunner
    {
        private static readonly object Lock = new object();
        private static bool _isExecute;
        private static bool _isNodeInstalled;
        private static bool _isSupervisorInstalled;
        private static bool _isRunning;
        private static bool _isOpen;

        private static string _serverJsVersion = "";
        private static DateTime _lastCheckUpdate = DateTime.MinValue;
        private static Process? _runningTask;

        public static void Process()
        {
            ExecuteOnlyOne(() =>
            {
                if (!InstallNode() || !InstallSupervisor())
                {
                    Log.Add("Не удалось запустить приложение");
                    return;
                }

                CheckUpdateAndRun();
                Open();
            });
        }

        public static void Stop()
        {
            if (_runningTask == null)
            {
                return;
            }

            _isRunning = false;

            Log.Add("Завершаем работу приложения");
            CommandLine.Close(
                _runningTask,
                _ => System.Diagnostics.Process.GetProcessesByName("node")
            );
        }

        private static bool InstallNode()
        {
            if (IsAlreadyWork(ref _isNodeInstalled))
            {
                return true;
            }

            Log.Add("Начало проверки установки среды выполнения Node.js");
            if (IsInstalled())
            {
                Log.Add("Node.js уже установлена");
                return true;
            }

            Log.Add("Запускаем установку Node.js. Следуйте инструкции установки");
            RunInstall();

            var isInstalled = WaitWhileInstalling();
            if (isInstalled)
            {
                Log.Add("Node.js успешно установлена");
                return true;
            }

            Log.Add("Не удалось установить Node.js");
            return false;

            bool IsInstalled()
            {
                var result = CommandLine.Execute("where node");
                return result.All(x => !x.Contains(
                    "Could not find files for the given pattern",
                    StringComparison.InvariantCultureIgnoreCase));
            }

            void RunInstall()
            {
                if (CommandLine.IsWindows)
                {
                    CommandLine.Execute("del node.msi /q");

                    CommandLine.Execute(
                        "curl https://nodejs.org/dist/v22.5.1/node-v22.5.1-x64.msi --output node.msi"
                    );

                    CommandLine.Execute("node.msi");
                }
                else
                {
                    Log.Add("Установите Node.js самостоятельно https://nodejs.org");
                    throw new NotImplementedException();
                }
            }

            bool WaitWhileInstalling()
            {
                var timer = Stopwatch.StartNew();

                while (timer.Elapsed < TimeSpan.FromMinutes(30))
                {
                    if (IsInstalled())
                    {
                        return true;
                    }

                    Task.Delay(TimeSpan.FromSeconds(10)).GetAwaiter().GetResult();
                }

                return false;
            }
        }

        private static bool InstallSupervisor()
        {
            if (IsAlreadyWork(ref _isSupervisorInstalled))
            {
                return true;
            }

            Log.Add("Начало поверки установки менеджера приложения");
            if (IsInstalled())
            {
                Log.Add("Менеджер приложения уже установлен");
                return true;
            }

            Log.Add("Запускаем установку менеджера приложения");
            RunInstall();

            var isInstalled = IsInstalled();
            if (isInstalled)
            {
                Log.Add("Менеджер приложения успешно установлен");
                return true;
            }

            Log.Add("Не удалось установить менеджер приложения");
            return false;

            bool IsInstalled()
            {
                var result = CommandLine.Execute("where supervisor");
                return result.All(x => !x.Contains(
                    "Could not find files for the given pattern",
                    StringComparison.InvariantCultureIgnoreCase));
            }

            void RunInstall()
            {
                CommandLine.Execute("npm i supervisor -g");
            }
        }

        private static void CheckUpdateAndRun()
        {
            if (IsAlreadyWork(ref _lastCheckUpdate, TimeSpan.FromMinutes(5)))
            {
                return;
            }

            Log.Add("Начало проверки обновления приложения");
            Prepare();

            if (!NeedUpdate())
            {
                Log.Add("Уже установлено последнее обновление");
                return;
            }

            Stop();

            Log.Add("Начинаем обновление приложения");
            Update();
            Log.Add("Приложение обновлено успешно");

            Run();

            bool NeedUpdate()
            {
                LoadFile(
                    "https://mining-monitor.github.io/mining-monitor/js/server.js.VERSION.txt",
                    "web-server/server.js.VERSION.txt"
                );

                var serverJsVersion = File.ReadAllText(
                    Path.Combine(CommandLine.GetWorkDirectory("web-server"), "server.js.VERSION.txt")
                ).Trim();

                var needUpdate = _serverJsVersion != serverJsVersion;

                _serverJsVersion = serverJsVersion;
                return needUpdate;
            }

            void Prepare()
            {
                if (!Directory.Exists(CommandLine.GetWorkDirectory("web-server")))
                {
                    Directory.CreateDirectory(CommandLine.GetWorkDirectory("web-server"));
                }
            }

            void Update()
            {
                LoadFile(
                    "https://mining-monitor.github.io/mining-monitor/js/server.js",
                    "web-server/server.js"
                );
            }

            void LoadFile(string url, string path)
            {
                CommandLine.Execute($"curl {url} --output {path}");
            }
        }

        private static void Run()
        {
            if (IsAlreadyWork(ref _isRunning))
            {
                return;
            }

            Log.Add("Запускаем приложение");

            _runningTask = CommandLine.Run("supervisor -w server.js server.js", "web-server");

            Task.Delay(TimeSpan.FromSeconds(1)).GetAwaiter().GetResult(); // Ждем запуска веб сервера
            Log.Add("Приложение успешно запущено");
        }

        private static void Open()
        {
            if (IsAlreadyWork(ref _isOpen))
            {
                return;
            }

            CommandLine.Execute($"{CommandLine.OpenUrlCmd} http://localhost:4000");
            Log.Add("Откройте в браузере http://localhost:4000");
        }

        private static void ExecuteOnlyOne(Action action)
        {
            if (_isExecute)
            {
                return;
            }

            lock (Lock)
            {
                if (_isExecute)
                {
                    return;
                }

                _isExecute = true;

                try
                {
                    action();
                }
                catch (Exception ex)
                {
                    Log.Add(ex.Message);
                }
                finally
                {
                    _isExecute = false;
                }
            }
        }

        private static bool IsAlreadyWork(ref bool isWork)
        {
            if (isWork)
            {
                return true;
            }

            isWork = true;
            return false;
        }

        private static bool IsAlreadyWork(ref DateTime lastWork, TimeSpan interval)
        {
            if (DateTime.Now - lastWork < interval)
            {
                return true;
            }

            lastWork = DateTime.Now;
            return false;
        }
    }
}