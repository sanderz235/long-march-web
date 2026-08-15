using System.Windows;
using System.Windows.Input;
using System.Windows.Media;
using SkiaSharp;
using SkiaSharp.Views.Desktop;
using SkiaSharp.Views.WPF;
using LongMarchWindows.Data;
using LongMarchWindows.Rendering;
using LongMarchWindows.ViewModels;

namespace LongMarchWindows.Controls;

public class MapGameControl : SKElement
{
    private SKBitmap? _background;

    public static readonly DependencyProperty ViewModelProperty =
        DependencyProperty.Register(nameof(ViewModel), typeof(GameViewModel), typeof(MapGameControl),
            new PropertyMetadata(null, OnViewModelChanged));

    public GameViewModel? ViewModel
    {
        get => (GameViewModel?)GetValue(ViewModelProperty);
        set => SetValue(ViewModelProperty, value);
    }

    public MapGameControl()
    {
        Loaded += OnLoaded;
    }

    private static void OnViewModelChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
    {
        if (d is MapGameControl control)
        {
            if (e.OldValue is GameViewModel old) old.PropertyChanged -= control.OnViewModelPropertyChanged;
            if (e.NewValue is GameViewModel vm) vm.PropertyChanged += control.OnViewModelPropertyChanged;
            control.InvalidateVisual();
        }
    }

    private void OnViewModelPropertyChanged(object? sender, System.ComponentModel.PropertyChangedEventArgs e)
    {
        InvalidateVisual();
    }

    private void OnLoaded(object sender, RoutedEventArgs e)
    {
        LoadBackground();
        InvalidateVisual();
    }

    private void LoadBackground()
    {
        try
        {
            var path = System.IO.Path.Combine(AppContext.BaseDirectory, "Assets", "map_bg.png");
            if (System.IO.File.Exists(path))
                _background = SKBitmap.Decode(path);
        }
        catch
        {
            _background = null;
        }
    }

    protected override void OnPaintSurface(SKPaintSurfaceEventArgs e)
    {
        base.OnPaintSurface(e);

        var canvas = e.Surface.Canvas;
        // 画布坐标系为物理像素（含系统 DPI 缩放），必须用 e.Info 的实际画布尺寸，
        // 否则在 200% 缩放下内容会被绘制在左上角一小块区域。
        float cw = e.Info.Width;
        float ch = e.Info.Height;
        canvas.Clear(new SKColor(0x12, 0x0a, 0x05));
        if (cw <= 0 || ch <= 0) return;

        float scale = Math.Min(cw / GameData.CanvasWidth, ch / GameData.CanvasHeight);
        float drawW = GameData.CanvasWidth * scale;
        float drawH = GameData.CanvasHeight * scale;
        float ox = (cw - drawW) / 2;
        float oy = (ch - drawH) / 2;

        if (_background != null)
            canvas.DrawBitmap(_background, new SKRect(ox, oy, ox + drawW, oy + drawH));

        canvas.Save();
        canvas.Translate(ox, oy);
        canvas.Scale(scale, scale);

        if (ViewModel != null)
            MapRenderer.Draw(canvas, ViewModel);

        canvas.Restore();
    }

    protected override void OnMouseLeftButtonUp(MouseButtonEventArgs e)
    {
        base.OnMouseLeftButtonUp(e);

        if (ViewModel == null) return;

        float cw = (float)ActualWidth;
        float ch = (float)ActualHeight;
        if (cw <= 0 || ch <= 0) return;

        float scale = Math.Min(cw / GameData.CanvasWidth, ch / GameData.CanvasHeight);
        float drawW = GameData.CanvasWidth * scale;
        float drawH = GameData.CanvasHeight * scale;
        float ox = (cw - drawW) / 2;
        float oy = (ch - drawH) / 2;

        // GetPosition 返回 DIP 坐标，画布是物理像素，需按 DPI 换算成同一坐标系
        var dpi = VisualTreeHelper.GetDpi(this);
        var pos = e.GetPosition(this);
        float lx = (float)((pos.X * dpi.DpiScaleX - ox) / scale);
        float ly = (float)((pos.Y * dpi.DpiScaleY - oy) / scale);

        foreach (var level in ViewModel.Levels)
        {
            float dx = level.X - lx;
            float dy = level.Y - ly;
            if (dx * dx + dy * dy <= 20f * 20f)
            {
                ViewModel.ClickStation(level.Id);
                return;
            }
        }
    }
}
