import { useState } from "react";
import { Typography } from "../components/layouts";
import { ListItem } from "../components/lists";
import { t } from "../renderer/global";
import { ProcessesService } from "../struct/processes";
import { LoggerService } from "../tools/logging";

export default function ProcessesPage(): JSX.Element {
  const minecraftProcesses = ProcessesService.processes;
  const [selected, setSelected] = useState(-1);
  const current = minecraftProcesses[selected];

  return (
    <div className="flex eph-h-full">
      <div className="overflow-y-scroll w-1/4">
        <div className="border-b border-divide">
          <ListItem
            checked={selected === -1}
            onClick={() => setSelected(-1)}
            className="rounded-lg m-3 p-3"
          >
            <Typography>{t.epherome}</Typography>
          </ListItem>
        </div>
        {minecraftProcesses.length === 0 ? (
          <div className="flex justify-center">
            <Typography className="text-shallow" textInherit>
              {t.noMinecraftProcesses}
            </Typography>
          </div>
        ) : (
          minecraftProcesses.map((value, index) => (
            <ListItem
              className="rounded-lg m-3 p-3"
              checked={selected === index}
              onClick={() => setSelected(index)}
              key={index}
            >
              <Typography>{value.profile.name}</Typography>
            </ListItem>
          ))
        )}
      </div>
      <div className="w-3/4 border-l border-divide overflow-y-scroll p-3">
        {current ? (
          <div>{current.outputs.join("")}</div>
        ) : (
          <div>{LoggerService.logs.join("\n")}</div>
        )}
      </div>
    </div>
  );
}
