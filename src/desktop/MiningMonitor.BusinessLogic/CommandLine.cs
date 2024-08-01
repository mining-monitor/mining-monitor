using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;

namespace MiningMonitor.BusinessLogic
{
    public static class CommandLine
    {
        private static bool IsWindows => RuntimeInformation.IsOSPlatform(OSPlatform.Windows);
        private static string Cmd => IsWindows ? "cmd" : "bash";
       
        public static string OpenUrlCmd => IsWindows ? "start" : "xdg-open";

        public static List<string> Execute(string command, string directory = "")
        {
            var output = new List<string>();

            using var process = new Process();
            process.StartInfo.FileName = Cmd;
            process.StartInfo.UseShellExecute = false;
            process.StartInfo.CreateNoWindow = true;
            process.StartInfo.RedirectStandardError = true;
            process.StartInfo.RedirectStandardOutput = true;
            process.StartInfo.RedirectStandardInput = true;
            process.StartInfo.WorkingDirectory = GetWorkDirectory(directory);
            process.OutputDataReceived += (a, b) => output.Add(b.Data ?? "");
            process.ErrorDataReceived += (a, b) => output.Add(b.Data ?? "");

            process.Start();
            process.BeginErrorReadLine();
            process.BeginOutputReadLine();

            using (var sw = process.StandardInput)
            {
                if (sw.BaseStream.CanWrite)
                {
                    sw.WriteLine("chcp 437");
                    sw.WriteLine(command);
                    sw.WriteLine("exit");
                }
            }

            process.WaitForExit();
            return output;
        }

        public static Process Run(string command, string directory = "")
        {
            var process = new Process();
            process.StartInfo.FileName = Cmd;
            process.StartInfo.UseShellExecute = false;
            process.StartInfo.CreateNoWindow = true;
            process.StartInfo.RedirectStandardInput = true;
            process.StartInfo.WorkingDirectory = GetWorkDirectory(directory);

            process.Start();

            using var sw = process.StandardInput;
            if (sw.BaseStream.CanWrite)
            {
                sw.WriteLine(command);
                sw.WriteLine("exit");
            }

            return process;
        }

        public static void Close(Process process, Func<Process, IEnumerable<Process>> getChildProcesses)
        {
            foreach (var childProcess in getChildProcesses(process))
            {
                childProcess.Kill();
                childProcess.Dispose();
            }

            process.Kill();
            process.Dispose();
        }

        public static string GetWorkDirectory(params string[] directories)
        {
#if DEBUG
            const string programDirectory = ".mining-monitor-debug";
#else
            const string programDirectory = ".mining-monitor";
#endif

            var workDirectory = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
                programDirectory
            );

            if (!Directory.Exists(workDirectory))
            {
                Directory.CreateDirectory(workDirectory);
            }

            return Path.Combine(new[] { workDirectory }.Concat(directories).ToArray());
        }
    }
}