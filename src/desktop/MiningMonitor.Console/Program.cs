using MiningMonitor.BusinessLogic;

Log.Add("Запуск приложения...");

var timer = new Timer(_ => Task.Run(ServerRunner.Process));
timer.Change(TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(10));

while (true)
{
    Log.Add("Введите 'exit' для выхода");

    var line = Console.ReadLine();
    if (line == "exit")
    {
        break;
    }
}

ServerRunner.Stop();