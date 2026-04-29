package com.polarier.auto;

import android.app.DownloadManager;
import android.content.Context;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

public class MainActivity extends BridgeActivity {

    @CapacitorPlugin(name = "Downloader")
    public static class DownloaderPlugin extends Plugin {
        @PluginMethod
        public void download(PluginCall call) {
            String url      = call.getString("url");
            String fileName = call.getString("fileName", "archivo");
            if (url == null || url.isEmpty()) {
                call.reject("url required");
                return;
            }
            try {
                DownloadManager dm = (DownloadManager) getActivity()
                        .getSystemService(Context.DOWNLOAD_SERVICE);
                DownloadManager.Request req = new DownloadManager.Request(Uri.parse(url));
                req.setNotificationVisibility(
                        DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                req.setDestinationInExternalPublicDir(
                        Environment.DIRECTORY_DOWNLOADS, fileName);
                req.setMimeType("*/*");
                req.addRequestHeader("User-Agent",
                        "Mozilla/5.0 (Android) Polarier");
                dm.enqueue(req);
                call.resolve();
            } catch (Exception e) {
                call.reject("Download failed: " + e.getMessage());
            }
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(DownloaderPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
