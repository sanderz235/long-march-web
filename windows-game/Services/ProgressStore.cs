using System.IO;
using System.Text.Json;

namespace LongMarchWindows.Services;

public class ProgressStore
{
    public record ProgressData(List<int> CompletedLevels, int PlayerStationId);

    private readonly string _path = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
        "LongMarchWindows",
        "progress.json");

    public ProgressData Load()
    {
        try
        {
            if (File.Exists(_path))
            {
                var data = JsonSerializer.Deserialize<ProgressData>(File.ReadAllText(_path));
                if (data != null) return data;
            }
        }
        catch
        {
            // 存档损坏时回退到初始进度
        }

        return new ProgressData(new List<int>(), 1);
    }

    public void Save(ProgressData data)
    {
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(_path)!);
            File.WriteAllText(_path, JsonSerializer.Serialize(data));
        }
        catch
        {
            // 存档失败不影响游戏运行
        }
    }
}
