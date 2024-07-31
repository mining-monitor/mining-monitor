using System.Diagnostics;
using System.Management;

namespace MiningMonitor
{
    public static class CommandLine
    {
        public static List<string> Execute(string command, string directory = "")
        {
            var output = new List<string>();

            using var process = new Process();
            process.StartInfo.FileName = "cmd";
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
            process.StartInfo.FileName = "cmd";
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

        public static void Close(Process process)
        {
            foreach (var childProcess in process.GetChildProcesses())
            {
                childProcess.Kill();
                childProcess.Dispose();
            }

            process.Kill();
            process.Dispose();
        }

        public static string GetWorkDirectory(string directory)
        {
#if DEBUG
            const string programDirectory = "MiningMonitorDebug";
#else
            const string programDirectory = "MiningMonitor";
#endif

            var workDirectory = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                programDirectory
            );

            if (!Directory.Exists(workDirectory))
            {
                Directory.CreateDirectory(workDirectory);
            }

            return Path.Combine(workDirectory, directory);
        }

        private static IEnumerable<Process> GetChildProcesses(this Process process)
        {
            var result = new ManagementObjectSearcher(
                $"Select * From Win32_Process Where ParentProcessID={process.Id}"
            );

            foreach (var item in result.Get())
            {
                yield return Process.GetProcessById(Convert.ToInt32(item["ProcessID"]));
            }
        }
    }
}