package com.aethermoore.claycompiler;

import android.app.Activity;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Build;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

public final class MainActivity extends Activity {
    private static final String COMPILER_URL = "http://127.0.0.1:5174/#compiler";
    private WebView web;

    private static boolean isCompilerUri(Uri uri) {
        return uri != null
            && "http".equals(uri.getScheme())
            && "127.0.0.1".equals(uri.getHost())
            && uri.getPort() == 5174;
    }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(247, 248, 252));
        getWindow().setNavigationBarColor(Color.rgb(247, 248, 252));
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);

        web = new WebView(this);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setUserAgentString(settings.getUserAgentString() + " ClayCompiler/0.1.0");
        if (android.os.Build.VERSION.SDK_INT >= 26) settings.setSafeBrowsingEnabled(true);

        web.setDownloadListener((url, agent, disposition, mime, length) ->
            Toast.makeText(this, "Downloads are disabled in Clay Compiler.", Toast.LENGTH_SHORT).show());
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !isCompilerUri(request.getUrl());
            }

            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) showConnectionPage();
            }
        });
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(247, 248, 252));
        root.addView(web, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT));
        root.setOnApplyWindowInsetsListener((view, insets) -> {
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            } else {
                view.setPadding(
                    insets.getSystemWindowInsetLeft(),
                    insets.getSystemWindowInsetTop(),
                    insets.getSystemWindowInsetRight(),
                    insets.getSystemWindowInsetBottom());
            }
            return insets;
        });
        setContentView(root);
        web.loadUrl(COMPILER_URL);
    }

    private void showConnectionPage() {
        String html = "<!doctype html><meta name='viewport' content='width=device-width,initial-scale=1'>"
            + "<style>body{font:18px sans-serif;background:#f7f8fc;color:#13213c;padding:8vw;max-width:720px;margin:auto}"
            + "h1{font-size:34px}a{display:inline-block;background:#f0441d;color:white;padding:14px 22px;border-radius:12px;text-decoration:none;font-weight:bold}"
            + "code{background:#e8ebf2;padding:3px 7px;border-radius:5px}</style>"
            + "<h1>Connect Clay Compiler</h1><p>The editor is safe. Its language checkers live on your PC.</p>"
            + "<p>Connect this tablet by USB, then run <code>ops\\connect-tablet.ps1</code> on the PC.</p>"
            + "<p><a href='" + COMPILER_URL + "'>Retry connection</a></p>";
        web.loadDataWithBaseURL("https://clay-compiler-offline.invalid/", html, "text/html", "UTF-8", null);
    }

    @Override public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override protected void onDestroy() {
        if (web != null) {
            web.stopLoading();
            web.destroy();
        }
        super.onDestroy();
    }
}
