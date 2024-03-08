import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <Skeleton className="size-40 rounded-lg" />
          </CardHeader>
          <CardFooter>
            <Skeleton className="inline-block size-5 rounded-lg" />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
