using System.Windows;
using System.Windows.Input;
using LongMarchWindows.ViewModels;

namespace LongMarchWindows;

public partial class MainWindow : Window
{
    private readonly GameViewModel _viewModel = new();

    public MainWindow()
    {
        InitializeComponent();
        DataContext = _viewModel;
    }

    private void OnLockedOverlayMouseDown(object sender, MouseButtonEventArgs e)
    {
        _viewModel.DismissLockedInfo();
    }

    private void OnLockedCardMouseDown(object sender, MouseButtonEventArgs e)
    {
        e.Handled = true;
    }

    private void OnCloseLockedClick(object sender, RoutedEventArgs e)
    {
        _viewModel.DismissLockedInfo();
    }

    private void OnResetClick(object sender, RoutedEventArgs e)
    {
        _viewModel.Reset();
    }
}
