using MiningMonitor.BusinessLogic;

namespace MiningMonitor
{
    public partial class Main : Form
    {
        private bool isNotificationShowed;
        private bool isQuit;

        public Main()
        {
            InitializeComponent();
        }

        private void Main_Load(object sender, EventArgs e)
        {
            openToolStripMenuItem.Click += HandleOpen!;
            closeToolStripMenuItem.Click += HandleClose!;
            Log.Add("Начало запуска приложения");
        }

        private void HandleOpen(object sender, EventArgs e)
        {
            CommandLine.Execute("start http://localhost:4000");
        }

        private void HandleClose(object sender, EventArgs e)
        {
            isQuit = true;
            Close();
        }

        private void timer_Tick(object sender, EventArgs e)
        {
            Task.Run(ServerRunner.Process);
            textBoxLog.Lines = Log.Get();
        }

        private void Main_FormClosing(object sender, FormClosingEventArgs e)
        {
            if(!isQuit)
            {
                HideWindow();
                e.Cancel = true;
            }
        }

        private void Main_FormClosed(object sender, FormClosedEventArgs e)
        {
            ServerRunner.Stop();
        }

        private void Main_Resize(object sender, EventArgs e)
        {
            if (WindowState == FormWindowState.Minimized)
            {
                HideWindow();
            }
        }

        private void notifyIcon_MouseDoubleClick(object sender, MouseEventArgs e)
        {
            ToggleWindow();
        }

        private void ToggleWindow()
        {
            if (WindowState == FormWindowState.Minimized)
            {
                OpenWindow();
            }
            else
            {
                HideWindow();
            }
        }

        private void OpenWindow()
        {
            Show();
            WindowState = FormWindowState.Normal;
            Focus();
        }

        private void HideWindow()
        {
            Hide();
            WindowState = FormWindowState.Minimized;

            if (isNotificationShowed)
            {
                return;
            }

            isNotificationShowed = true;
            notifyIcon.ShowBalloonTip(5000);
        }
    }
}