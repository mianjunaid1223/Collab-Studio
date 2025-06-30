import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Palette, Users, MousePointerClick } from "lucide-react";
import { ProjectCard } from "@/components/project/project-card";
import { getCompletedProjects } from "@/lib/firestore";
import type { Project } from "@/lib/types";

export default async function Home() {
  const completedProjects: Project[] = await getCompletedProjects(3);

  return (
    <div className="flex flex-col min-h-screen">
      <section className="w-full py-20 md:py-32 lg:py-40 bg-primary/10">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                  Collaborate. Create. Connect.
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl font-body">
                  Pixel Canvas Collab is a digital mindfulness and teamwork tool. Create beautiful pixel art together, one pixel at a time.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/explore">
                    Explore Canvases
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/create">
                    Create a Project
                  </Link>
                </Button>
              </div>
            </div>
            <Image
              src="https://placehold.co/600x400.png"
              data-ai-hint="pixel art collaboration"
              width="600"
              height="400"
              alt="Hero"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full"
            />
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">How It Works</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">A Journey of a Thousand Pixels</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-body">
                Our platform encourages patience and collaboration. No AI, no shortcuts. Just pure, handcrafted digital art.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
            <Card className="bg-card/80 border-2 border-transparent hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/20 text-primary">
                  <Palette className="h-6 w-6" />
                </div>
                <CardTitle>Describe Your Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Creators start projects with only a text description and a color palette. No image uploads allowed.</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-2 border-transparent hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center gap-4">
                 <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/20 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle>Contribute Pixels</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Contributors interpret the description and place pixels on the shared canvas, bringing it to life in real-time.</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-2 border-transparent hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/20 text-primary">
                  <MousePointerClick className="h-6 w-6" />
                </div>
                <CardTitle>Watch it Evolve</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">See the artwork come to life in real-time as users from all over the world contribute to the shared vision.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 lg:py-32 bg-secondary/30">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Featured Masterpieces</h2>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed font-body">
              Explore some of the incredible artwork completed by our community.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {completedProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
