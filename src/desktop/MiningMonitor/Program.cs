namespace MiningMonitor
{
    internal static class Program
    {
        /// <summary>
        ///  The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            try
            {
                ApplicationConfiguration.Initialize();
                Setup.Init();
                Application.Run(new Main());
            }
            finally
            {
                Setup.Close();
            }
        }
    }
}