"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import {
  useUserProfile,
  useUserPreferences,
  useUpdateProfile,
  useUpdatePreferences,
  useDeleteAccount,
  useImportBookmarks,
} from "@/hooks/use-user";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [profileName, setProfileName] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Query hooks
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const { data: preferences, isLoading: preferencesLoading } =
    useUserPreferences();

  // Mutation hooks
  const updateProfileMutation = useUpdateProfile();
  const updatePreferencesMutation = useUpdatePreferences();
  const deleteAccountMutation = useDeleteAccount();
  const importBookmarksMutation = useImportBookmarks();

  // Initialize form when data is loaded
  useEffect(() => {
    if (userProfile?.profile?.full_name && !profileName) {
      setProfileName(userProfile.profile.full_name);
    }
  }, [userProfile?.profile?.full_name, profileName]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // First get all bookmarks with folder information
      const { data: bookmarksData, error: bookmarksError } =
        await supabase.from("bookmarks").select(`
          *,
          folders:folder_id(name)
        `);

      if (bookmarksError) throw bookmarksError;

      // Then get tag information for each bookmark
      const bookmarksWithTags = await Promise.all(
        (bookmarksData || []).map(async (bookmark) => {
          const { data: tagData } = await supabase
            .from("bookmark_tags")
            .select(
              `
              tags:tag_id(
                name,
                color
              )
            `
            )
            .eq("bookmark_id", bookmark.id);

          return {
            ...bookmark,
            tags: tagData?.map((item) => item.tags) || [],
          };
        })
      );

      const exportData = {
        version: "1.0",
        exported_at: new Date().toISOString(),
        bookmarks: bookmarksWithTags,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bookmarks-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: "Your bookmarks have been exported successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to export bookmarks. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleProfileUpdate = () => {
    if (profileName.trim()) {
      updateProfileMutation.mutate({ full_name: profileName.trim() });
    }
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    updatePreferencesMutation.mutate({ [key]: value });
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importBookmarksMutation.mutate(file);
      // Reset the input
      event.target.value = "";
    }
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate(undefined, {
      onSuccess: () => {
        router.push("/login");
      },
    });
  };

  if (profileLoading || preferencesLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userProfile?.user?.email || ""}
                  disabled
                />
              </div>
              <Button
                onClick={handleProfileUpdate}
                disabled={
                  updateProfileMutation.isPending ||
                  !profileName.trim() ||
                  profileName === userProfile?.profile?.full_name
                }
              >
                {updateProfileMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your bookmark manager experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-fetch Metadata</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically fetch title and favicon when adding bookmarks
                  </p>
                </div>
                <Switch
                  checked={preferences?.auto_fetch_metadata ?? true}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("auto_fetch_metadata", checked)
                  }
                  disabled={updatePreferencesMutation.isPending}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications about your bookmarks
                  </p>
                </div>
                <Switch
                  checked={preferences?.email_notifications ?? false}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange("email_notifications", checked)
                  }
                  disabled={updatePreferencesMutation.isPending}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export or import your bookmark data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <h4 className="text-sm font-medium">Export Bookmarks</h4>
                  <p className="text-sm text-muted-foreground">
                    Download all your bookmarks as a JSON file
                  </p>
                </div>
                <Button onClick={handleExport} disabled={isExporting}>
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    "Export Data"
                  )}
                </Button>
              </div>
              <div className="grid gap-4">
                <div>
                  <h4 className="text-sm font-medium">Import Bookmarks</h4>
                  <p className="text-sm text-muted-foreground">
                    Import bookmarks from a browser export or JSON file
                  </p>
                </div>
                <div className="grid gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.html"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    onClick={handleImport}
                    disabled={importBookmarksMutation.isPending}
                    variant="outline"
                  >
                    {importBookmarksMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      "Choose File to Import"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove all your bookmarks, folders, and
                      tags from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deleteAccountMutation.isPending}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteAccountMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Account"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
