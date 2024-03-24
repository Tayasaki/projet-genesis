import { Dices } from "lucide-react";
import { Button } from "./button";

export const RandomButton = ({ randomize }: { randomize: () => void }) => {
  return (
    <Button className="group" size={"sm"} type="button" onClick={randomize}>
      <Dices className="group-hover:animate-bounce" />
    </Button>
  );
};
