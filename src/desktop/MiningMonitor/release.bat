# release
dotnet build -c Release -o "./publish"
%userprofile%/.nuget/packages/clowd.squirrel/2.11.1/tools/Squirrel.exe pack --framework net6 --packId "MiningMonitor" --packVersion "1.0.4" --packTitle "MiningMonitor" --packAuthors "MiningMonitor" --packDirectory "./publish" --releaseDir "../../../docs/desktop" --icon "./favicon.ico" --setupIcon "./favicon.ico" --splashImage "install.gif"  --splashImage "install.gif" --noDelta

pause