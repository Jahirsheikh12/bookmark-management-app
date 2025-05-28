"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bookmark,
  Folder,
  Folders,
  Home,
  LayoutGrid,
  Plus,
  Search,
  Settings,
  Tag,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface FolderWithCount {
  id: string;
  name: string;
  parent_id: string | null;
  bookmarkCount: number;
}

interface TagWithCount {
  id: string;
  name: string;
  color: string | null;
  bookmarkCount: number;
}

export function DashboardNav() {
  const pathname = usePathname();
  const supabase = createClientComponentClient<Database>();
  const [folders, setFolders] = useState<FolderWithCount[]>([]);
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) return;

        // Fetch folders with bookmark counts
        const { data: foldersData } = await supabase
          .from("folders")
          .select(
            `
            id,
            name,
            parent_id,
            bookmarks(id)
          `
          )
          .order("name");

        if (foldersData) {
          const foldersWithCount = foldersData.map((folder) => ({
            id: folder.id,
            name: folder.name,
            parent_id: folder.parent_id,
            bookmarkCount: folder.bookmarks?.length || 0,
          }));
          setFolders(foldersWithCount);
        }

        // Fetch tags with bookmark counts
        const { data: tagsData } = await supabase
          .from("tags")
          .select(
            `
            id,
            name,
            color,
            bookmark_tags(bookmark_id)
          `
          )
          .order("name");

        if (tagsData) {
          const tagsWithCount = tagsData.map((tag) => ({
            id: tag.id,
            name: tag.name,
            color: tag.color,
            bookmarkCount: tag.bookmark_tags?.length || 0,
          }));
          setTags(tagsWithCount);
        }
      } catch (error) {
        console.error("Error fetching navigation data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  const mainNavItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      title: "All Bookmarks",
      href: "/dashboard/bookmarks",
      icon: <LayoutGrid className="mr-2 h-4 w-4" />,
    },
    {
      title: "Folders",
      href: "/dashboard/folders",
      icon: <Folders className="mr-2 h-4 w-4" />,
    },
    {
      title: "Tags",
      href: "/dashboard/tags",
      icon: <Tag className="mr-2 h-4 w-4" />,
    },
    {
      title: "Search",
      href: "/dashboard/search",
      icon: <Search className="mr-2 h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ];

  // Organize folders hierarchically
  const organizedFolders = folders.filter((folder) => !folder.parent_id);
  const subFolders = folders.filter((folder) => folder.parent_id);

  return (
    <div className="flex flex-col h-full space-y-4 py-2">
      <div className="px-2 py-2">
        <Link href="/dashboard/bookmarks/new">
          <Button className="w-full justify-start px-4 py-2 h-10">
            <Plus className="mr-2 h-4 w-4" />
            Add Bookmark
          </Button>
        </Link>
      </div>
      <div className="px-2 py-2">
        <h2 className="mb-3 px-3 text-sm font-semibold tracking-tight text-muted-foreground uppercase">
          Navigation
        </h2>
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "transparent"
              )}
            >
              {item.icon}
              <span className="truncate">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-2 py-2 flex-1">
        <div className="flex items-center justify-between mb-3 px-3">
          <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
            Folders
          </h2>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
            <Link href="/dashboard/folders/new">
              <Plus className="h-3 w-3" />
              <span className="sr-only">Add Folder</span>
            </Link>
          </Button>
        </div>
        <div className="space-y-1 pr-2 max-h-[40vh] overflow-y-auto">
          {loading ? (
            <div className="text-sm text-muted-foreground px-3 py-2">
              Loading folders...
            </div>
          ) : folders.length === 0 ? (
            <div className="text-sm text-muted-foreground px-3 py-2">
              No folders yet
            </div>
          ) : (
            <>
              {organizedFolders.map((folder) => (
                <div key={folder.id}>
                  <FolderItem
                    id={folder.id}
                    name={folder.name}
                    count={folder.bookmarkCount}
                    level={0}
                  />
                  {subFolders
                    .filter((sub) => sub.parent_id === folder.id)
                    .map((subFolder) => (
                      <FolderItem
                        key={subFolder.id}
                        id={subFolder.id}
                        name={subFolder.name}
                        count={subFolder.bookmarkCount}
                        level={1}
                      />
                    ))}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      <div className="px-2 py-2">
        <div className="flex items-center justify-between mb-3 px-3">
          <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
            Tags
          </h2>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
            <Link href="/dashboard/tags/new">
              <Plus className="h-3 w-3" />
              <span className="sr-only">Add Tag</span>
            </Link>
          </Button>
        </div>
        <div className="space-y-1 pr-2 max-h-[30vh] overflow-y-auto">
          {loading ? (
            <div className="text-sm text-muted-foreground px-3 py-2">
              Loading tags...
            </div>
          ) : tags.length === 0 ? (
            <div className="text-sm text-muted-foreground px-3 py-2">
              No tags yet
            </div>
          ) : (
            tags.map((tag) => (
              <TagItem
                key={tag.id}
                href={`/dashboard/tags/${tag.id}`}
                name={tag.name}
                count={tag.bookmarkCount}
                color={tag.color ? `bg-[${tag.color}]` : "bg-blue-500"}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function FolderItem({
  id,
  name,
  count,
  level,
}: {
  id: string;
  name: string;
  count: number;
  level: number;
}) {
  return (
    <Link
      href={`/dashboard/folders/${id}`}
      className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
      style={{ paddingLeft: `${level * 16 + 12}px` }}
    >
      <Folder className="mr-2 h-4 w-4 flex-shrink-0" />
      <span className="truncate flex-1">{name}</span>
      <span className="ml-auto text-xs text-muted-foreground">{count}</span>
    </Link>
  );
}

function TagItem({
  href,
  name,
  count,
  color,
}: {
  href: string;
  name: string;
  count: number;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <span
        className={`h-2 w-2 rounded-full ${color} mr-2 flex-shrink-0`}
      ></span>
      <span className="truncate flex-1">{name}</span>
      <span className="ml-auto text-xs text-muted-foreground">{count}</span>
    </Link>
  );
}
