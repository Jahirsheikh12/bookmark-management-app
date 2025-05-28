import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bookmark,
  FolderTree,
  Tags,
  Search,
  Upload,
  Download,
  MousePointerClick,
  Smartphone,
} from "lucide-react";

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="py-16 sm:py-20 md:py-24 space-y-12 w-full"
    >
      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <Badge className="px-4 py-2 text-sm font-medium" variant="secondary">
          Features
        </Badge>
        <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
          Everything you need to manage your bookmarks
        </h2>
        <p className="mx-auto max-w-[600px] text-gray-500 text-base sm:text-lg md:text-xl dark:text-gray-400 leading-relaxed">
          Our bookmark manager comes with all the features you need to organize
          your web resources efficiently and productively.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 pt-8 w-full">
        <FeatureCard
          icon={<Bookmark className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />}
          title="Smart Bookmarking"
          description="Save bookmarks with auto-fetched titles, favicons, and previews from any URL."
        />
        <FeatureCard
          icon={
            <FolderTree className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
          }
          title="Folder Organization"
          description="Create nested folders to organize bookmarks in a way that makes sense to you."
        />
        <FeatureCard
          icon={<Tags className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />}
          title="Tagging System"
          description="Add multiple tags to bookmarks for flexible categorization and easy filtering."
        />
        <FeatureCard
          icon={<Search className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />}
          title="Powerful Search"
          description="Find any bookmark quickly with full-text search across titles, URLs, and notes."
        />
        <FeatureCard
          icon={<Upload className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />}
          title="Import Bookmarks"
          description="Easily import your existing bookmarks from Chrome, Firefox, or any browser."
        />
        <FeatureCard
          icon={
            <MousePointerClick className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
          }
          title="Drag & Drop"
          description="Organize your bookmarks with intuitive drag-and-drop between folders and tags."
        />
        <FeatureCard
          icon={<Download className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />}
          title="Export Anytime"
          description="Export your bookmarks to standard formats compatible with all major browsers."
        />
        <FeatureCard
          icon={
            <Smartphone className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
          }
          title="Responsive Design"
          description="Access your bookmarks from any device with a fully responsive interface."
        />
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border bg-card hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full">
      <CardHeader className="pb-4 space-y-3">
        <div className="flex justify-center sm:justify-start">{icon}</div>
        <CardTitle className="text-lg sm:text-xl text-center sm:text-left leading-tight">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-sm sm:text-base text-center sm:text-left leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
