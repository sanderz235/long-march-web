namespace LongMarchWindows.Models;

public class LevelInfo
{
    public int Id { get; init; }
    public string MapLabel { get; init; } = string.Empty;
    public string ShortDesc { get; init; } = string.Empty;
    public float X { get; init; }
    public float Y { get; init; }
}
