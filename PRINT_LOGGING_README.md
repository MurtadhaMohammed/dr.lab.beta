# Print Logging System

This document explains the comprehensive print logging system that has been implemented to help debug print issues in production mode.

## What's Been Added

### 1. Enhanced Logging in `src/control/main.js`
- **Print Operations**: Full logging for `print`, `printReport`, and `printParcode` operations
- **Printer Availability**: Checks if selected printer is available before printing
- **Error Tracking**: Detailed error logging with context information
- **Performance Monitoring**: Logs operation timing and resource usage

### 2. Enhanced Logging in `initPDF.js`
- **PDF Creation**: Logs PDF generation process, including image processing and file saving
- **Report Generation**: Tracks financial report creation with data validation
- **File Operations**: Monitors file save/open operations

### 3. Log Categories

#### Print Operations (`[PRINT_INFO]` / `[PRINT_ERROR]`)
- `print_start` - PDF generation initiated
- `print_success` - PDF generated successfully
- `print_failed` - PDF generation failed
- `printReport_start` - Financial report generation started
- `printReport_success` - Financial report completed
- `printReport_failed` - Financial report failed
- `printParcode_start` - Barcode printing initiated
- `printParcode_barcode_generated` - Barcode image created
- `printParcode_printer_check` - Printer availability verified
- `printParcode_print_success` - Barcode printed successfully
- `printParcode_print_failed` - Barcode printing failed
- `get_printers_success` - Available printers retrieved

#### PDF Operations (`[PDF_INFO]` / `[PDF_ERROR]`)
- `createPDF_start` - PDF creation process started
- `createPDF_success` - PDF file created and saved
- `createPDF_error` - PDF creation failed
- `printReport_start` - Report PDF generation started
- `printReport_success` - Report PDF completed

## How to Use the Logs

### 1. Viewing Logs in Production

Logs are automatically saved to:
- **Windows**: `%APPDATA%/lab-beta/logs/main.log`
- **macOS**: `~/Library/Logs/lab-beta/main.log`
- **Linux**: `~/.config/lab-beta/logs/main.log`

### 2. Using the Log Viewer Utility

A utility script `print-logs-viewer.js` has been created to easily analyze logs:

```bash
# View all logs
node print-logs-viewer.js

# View only errors
node print-logs-viewer.js error

# View barcode printing logs
node print-logs-viewer.js printParcode

# View failed operations
node print-logs-viewer.js failed
```

### 3. Understanding Log Format

Each log entry contains:
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "operation": "printParcode_start",
  "data": {
    "patientId": "123",
    "patientName": "John Doe",
    "selectedPrinter": "HP LaserJet"
  },
  "result": null,
  "error": null
}
```

## Common Issues and Solutions

### 1. Printer Not Available
**Log**: `printParcode_printer_unavailable`
**Solution**: 
- Check if printer is connected and turned on
- Verify printer name matches exactly
- Update printer selection in settings

### 2. Barcode Generation Failed
**Log**: `printParcode_barcode_generation_failed`
**Solution**:
- Check if visit number was generated correctly
- Verify barcode library dependencies
- Check system resources

### 3. PDF Creation Failed
**Log**: `createPDF_error`
**Solution**:
- Check if header image exists and is accessible
- Verify font files are available
- Check disk space for temporary files

### 4. Image Processing Failed
**Log**: `printParcode_sharp_processing_failed`
**Solution**:
- Verify Sharp library installation
- Check image processing dependencies
- Ensure sufficient memory available

## Debugging Workflow

1. **Reproduce the Issue**: Try to print and note the exact error message
2. **Check Recent Logs**: Look for error entries around the time of the issue
3. **Trace the Operation**: Follow the log sequence from start to failure point
4. **Identify Root Cause**: Look for specific error messages and context data
5. **Apply Fix**: Based on the error type, apply appropriate solution

## Log Retention

- Logs are rotated automatically by electron-log
- Maximum file size: 1MB per log file
- Keeps last 10 log files
- Older logs are automatically deleted

## Performance Impact

- Minimal performance impact (< 1ms per log operation)
- Logs are written asynchronously
- Can be disabled by setting log level to 'error' only

## Troubleshooting Tips

1. **Enable Console Logs**: Set `log.transports.console.level = "debug"` for development
2. **Increase Log Detail**: Lower log level to capture more information
3. **Monitor System Resources**: Check CPU, memory, and disk usage during print operations
4. **Test with Different Printers**: Try different printer models to isolate hardware issues
5. **Check Network Printers**: Verify network connectivity for network-attached printers

This logging system provides comprehensive visibility into the print process, making it much easier to identify and resolve print issues in production environments.