import { Button, Card, CardContent, CardHeader } from "@cf/ui";
import { BellIcon } from "@cf/ui/icons";
import { Edit } from "lucide-react";

export default function ActivitySummaryCard() {
  return (
    <Card className="w-full rounded-3xl border-none bg-white p-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <h2 className="text-md font-semibold leading-none">Activity summary</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-green-600 hover:bg-green-50 hover:text-green-700"
        >
          <Edit className="mr-1 size-4" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="text-center">
        <div className="mb-4 flex justify-center">
          <BellIcon />
        </div>
        <h3 className="mb-3 text-base font-semibold">No activities</h3>
        <p className="text-gray-dark mb-8">No activities recorded</p>
      </CardContent>
    </Card>
  );
}
