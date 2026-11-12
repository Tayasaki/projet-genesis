import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { Skeleton } from "@/components/ui/skeleton";

export default function loading() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="max-w-md">
          <CardHeader className="flex flex-row">
            <Avatar>
              <AvatarFallback>
                <Loader />
              </AvatarFallback>
            </Avatar>
            <CardTitle>
              <Skeleton className="inline-block h-4 w-40" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
