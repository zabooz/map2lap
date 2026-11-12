param([string]$Action='capture',[string]$Name='ac-window.png',[int]$X=0,[int]$Y=0,[int]$EndX=0,[int]$EndY=0)
$probeCommonGit = & git -C $PSScriptRoot rev-parse --path-format=absolute --git-common-dir
if ($LASTEXITCODE -ne 0) { throw 'Cannot resolve shared preview directory' }
$probeRuntime = Join-Path (Split-Path $probeCommonGit -Parent) 'out/weather-probe'
Add-Type -AssemblyName System.Drawing
Add-Type @'
using System; using System.Runtime.InteropServices;
public class ProbeWindow {
 [StructLayout(LayoutKind.Sequential)] public struct Rect { public int L,T,R,B; }
 [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h,out Rect r);
 [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
 [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
 [DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();
 [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h,IntPtr p);
 [DllImport("user32.dll")] public static extern bool AttachThreadInput(uint a,uint b,bool attach);
 [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr h);
 [DllImport("user32.dll")] public static extern bool SetCursorPos(int x,int y);
 [DllImport("user32.dll")] public static extern void mouse_event(uint f,uint x,uint y,uint d,UIntPtr e);
 [DllImport("user32.dll")] public static extern void keybd_event(byte key,byte scan,uint flags,UIntPtr extra);
}
'@
$probeSession = Get-Content (Join-Path $probeRuntime 'session.json') | ConvertFrom-Json
$probeProcess = Get-Process -Id $probeSession.pid -ErrorAction Stop
if ($probeProcess.ProcessName -ne 'acs') { throw 'Unexpected process' }
$probeRect = New-Object ProbeWindow+Rect
if (-not [ProbeWindow]::GetWindowRect($probeProcess.MainWindowHandle,[ref]$probeRect)) { throw 'No AC window' }
if ($Action -eq 'capture' -and [ProbeWindow]::GetForegroundWindow() -ne $probeProcess.MainWindowHandle) { throw 'AC is not foreground; no screenshot taken' }
if ($Action -ne 'capture') {
 $probeThread = [ProbeWindow]::GetCurrentThreadId()
 $probeForegroundThread = [ProbeWindow]::GetWindowThreadProcessId([ProbeWindow]::GetForegroundWindow(),[IntPtr]::Zero)
 $probeGameThread = [ProbeWindow]::GetWindowThreadProcessId($probeProcess.MainWindowHandle,[IntPtr]::Zero)
 try {
  if ($probeForegroundThread -ne $probeThread) { [ProbeWindow]::AttachThreadInput($probeThread,$probeForegroundThread,$true) | Out-Null }
  if ($probeGameThread -ne $probeThread) { [ProbeWindow]::AttachThreadInput($probeThread,$probeGameThread,$true) | Out-Null }
  [ProbeWindow]::BringWindowToTop($probeProcess.MainWindowHandle) | Out-Null
  [ProbeWindow]::SetForegroundWindow($probeProcess.MainWindowHandle) | Out-Null
 } finally {
  if ($probeGameThread -ne $probeThread) { [ProbeWindow]::AttachThreadInput($probeThread,$probeGameThread,$false) | Out-Null }
  if ($probeForegroundThread -ne $probeThread) { [ProbeWindow]::AttachThreadInput($probeThread,$probeForegroundThread,$false) | Out-Null }
 }
 Start-Sleep -Milliseconds 200
 if ([ProbeWindow]::GetForegroundWindow() -ne $probeProcess.MainWindowHandle) { throw 'AC is not foreground; no input sent' }
 if ($Action -in @('click','drag')) {
  [ProbeWindow]::SetCursorPos(($probeRect.L+$X),($probeRect.T+$Y)) | Out-Null
  [ProbeWindow]::mouse_event(2,0,0,0,[UIntPtr]::Zero)
  Start-Sleep -Milliseconds 80
  if ($Action -eq 'drag') {
   Start-Sleep -Milliseconds 150
   [ProbeWindow]::SetCursorPos(($probeRect.L+$EndX),($probeRect.T+$EndY)) | Out-Null
   Start-Sleep -Milliseconds 150
  }
  [ProbeWindow]::mouse_event(4,0,0,0,[UIntPtr]::Zero)
 } elseif ($Action -eq 'drive') {
  [ProbeWindow]::SetCursorPos(($probeRect.L+58),($probeRect.T+205)) | Out-Null
  [ProbeWindow]::mouse_event(2,0,0,0,[UIntPtr]::Zero)
  [ProbeWindow]::mouse_event(4,0,0,0,[UIntPtr]::Zero)
 } elseif ($Action -eq 'free') {
  [ProbeWindow]::keybd_event(118,65,0,[UIntPtr]::Zero)
  [ProbeWindow]::keybd_event(118,65,2,[UIntPtr]::Zero)
 } elseif ($Action -eq 'raise') {
  [ProbeWindow]::keybd_event(33,73,1,[UIntPtr]::Zero)
  Start-Sleep -Milliseconds 3000
  [ProbeWindow]::keybd_event(33,73,3,[UIntPtr]::Zero)
 } elseif ($Action -eq 'tilt') {
  [ProbeWindow]::SetCursorPos(($probeRect.L+648),($probeRect.T+380)) | Out-Null
  [ProbeWindow]::mouse_event(8,0,0,0,[UIntPtr]::Zero)
  [ProbeWindow]::mouse_event(1,0,70,0,[UIntPtr]::Zero)
  [ProbeWindow]::mouse_event(16,0,0,0,[UIntPtr]::Zero)
 } elseif ($Action -eq 'exposure-back') {
  [ProbeWindow]::keybd_event(34,81,1,[UIntPtr]::Zero)
  Start-Sleep -Milliseconds 100
  [ProbeWindow]::keybd_event(34,81,3,[UIntPtr]::Zero)
 } elseif ($Action -eq 'back') {
  [ProbeWindow]::keybd_event(40,80,1,[UIntPtr]::Zero)
  Start-Sleep -Milliseconds 3000
  [ProbeWindow]::keybd_event(40,80,3,[UIntPtr]::Zero)
 } elseif ($Action -in @('rain','snow','off','fog','wind','direction')) {
  $weatherKey = @{rain=82; snow=83; off=48; fog=70; wind=87; direction=68}[$Action]
  try {
   [ProbeWindow]::keybd_event(17,0,0,[UIntPtr]::Zero)
   [ProbeWindow]::keybd_event(18,0,0,[UIntPtr]::Zero)
   [ProbeWindow]::keybd_event($weatherKey,0,0,[UIntPtr]::Zero)
   Start-Sleep -Milliseconds 120
  } finally {
   [ProbeWindow]::keybd_event($weatherKey,0,2,[UIntPtr]::Zero)
   [ProbeWindow]::keybd_event(18,0,2,[UIntPtr]::Zero)
   [ProbeWindow]::keybd_event(17,0,2,[UIntPtr]::Zero)
  }
 } elseif ($Action -eq 'focus-capture') {
  # Window activation only; no input.
 } elseif ($Action -eq 'escape') {
  [ProbeWindow]::keybd_event(27,0,0,[UIntPtr]::Zero)
  [ProbeWindow]::keybd_event(27,0,2,[UIntPtr]::Zero)
 } else { throw 'Unknown action' }
 Start-Sleep -Milliseconds 600
}
if (-not [ProbeWindow]::GetWindowRect($probeProcess.MainWindowHandle,[ref]$probeRect)) { throw 'AC window changed' }
$probeImage = New-Object System.Drawing.Bitmap(($probeRect.R-$probeRect.L),($probeRect.B-$probeRect.T))
$probeGraphics = [System.Drawing.Graphics]::FromImage($probeImage)
$probeGraphics.CopyFromScreen($probeRect.L,$probeRect.T,0,0,$probeImage.Size)
$probeImage.Save((Join-Path $probeRuntime $Name))
$probeGraphics.Dispose()
$probeImage.Dispose()
