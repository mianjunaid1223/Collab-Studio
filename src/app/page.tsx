import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Palette, Users, MousePointerClick } from "lucide-react";
import { ProjectCard } from "@/components/project/project-card";
import { getCompletedProjects } from "@/lib/data";
import type { Project } from "@/lib/types";

export default async function Home() {
  const completedProjects: Project[] = await getCompletedProjects(3);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <section className="w-full pt-20 md:pt-32 lg:pt-40 pb-10 md:pb-16 lg:pb-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-0"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)),transparent_50%)]"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
                  Create together. Interpret. Stitch meaning.
                </h1>
                <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl font-body">
                  Pixel Canvas Collab is a digital mindfulness and teamwork tool. Create beautiful art together, one contribution at a time.
                </p>
              </div>
              <div className="flex flex-col gap-3 min-[400px]:flex-row">
                <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                  <Link href="/explore">
                    Explore Canvases
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/create">
                    Start a Project
                  </Link>
                </Button>
              </div>
            </div>
            <Image
              src="https://placehold.co/600x400.png"
              data-ai-hint="abstract art collaboration"
              width="600"
              height="400"
              alt="Hero"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full border-2 border-border/50 shadow-2xl shadow-primary/10"
            />
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-3">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm font-medium">How It Works</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">A Journey of Shared Creativity</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-body">
                Our platform encourages patience and collaboration. No AI, no shortcuts. Just pure, handcrafted digital art.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
            <Card className="bg-card/80 border border-border/30 hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 p-6 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
                  <Palette className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Describe Your Vision</h3>
                <p className="text-sm text-muted-foreground">Creators start projects with only a text description. No image uploads allowed.</p>
            </Card>
            <Card className="bg-card/80 border border-border/30 hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 p-6 text-center">
                 <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Contribute Pieces</h3>
                <p className="text-sm text-muted-foreground">Contributors interpret the description and place pieces on the shared canvas, bringing it to life.</p>
            </Card>
            <Card className="bg-card/80 border border-border/30 hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 p-6 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
                  <MousePointerClick className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Watch it Evolve</h3>
                <p className="text-sm text-muted-foreground">See the artwork come to life in real-time as users from all over the world contribute to the shared vision.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 lg:py-32 bg-secondary/30">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Featured Masterpieces</h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-body">
              Explore some of the incredible artwork completed by our community.
            </p>
          </div>
          {completedProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
              {completedProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
             <div className="text-center py-16 text-muted-foreground col-span-full">
                <p>No masterpieces have been completed yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
