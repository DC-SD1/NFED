"use client";

import { Button } from "@cf/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@cf/ui/components/card";

import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
  showWarningToast,
} from "@/lib/utils/toast";

export default function NotificationsDemoPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications Demo</h1>
          <p className="text-muted-foreground mt-2">
            Test all notification types and styles
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Toast Notifications</CardTitle>
            <CardDescription>
              Click the buttons below to test different notification types
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Button
                onClick={() =>
                  showSuccessToast("Operation completed successfully!")
                }
                variant="default"
                className="w-full"
              >
                Success Toast
              </Button>

              <Button
                onClick={() => showErrorToast("An error occurred!")}
                variant="destructive"
                className="w-full"
              >
                Error Toast
              </Button>

              <Button
                onClick={() => showWarningToast("This is a warning message")}
                variant="outline"
                className="w-full"
              >
                Warning Toast
              </Button>

              <Button
                onClick={() => showInfoToast("Here's some helpful information")}
                variant="secondary"
                className="w-full"
              >
                Info Toast
              </Button>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-3 font-semibold">Custom Messages</h3>
              <div className="space-y-3">
                <Button
                  onClick={() =>
                    showSuccessToast(
                      "Your farm plan has been created successfully! You can now start adding crops.",
                    )
                  }
                  variant="default"
                  className="w-full"
                >
                  Long Success Message
                </Button>

                <Button
                  onClick={() =>
                    showErrorToast(
                      "Failed to save changes. Please check your internet connection and try again.",
                    )
                  }
                  variant="destructive"
                  className="w-full"
                >
                  Long Error Message
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-3 font-semibold">Multiple Toasts</h3>
              <Button
                onClick={() => {
                  showSuccessToast("First notification");
                  setTimeout(() => showInfoToast("Second notification"), 500);
                  setTimeout(
                    () => showWarningToast("Third notification"),
                    1000,
                  );
                }}
                variant="outline"
                className="w-full"
              >
                Show Multiple Toasts
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Styles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded"
                  style={{ backgroundColor: "#008744" }}
                />
                <span>Success: #008744</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded"
                  style={{ backgroundColor: "#BA1A1A" }}
                />
                <span>Error: #BA1A1A</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-gray-200" />
                <span>Info & Warning: Default theme colors</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
