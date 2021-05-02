import { spawn } from "child_process";
import StreamZip from "node-stream-zip";
import os from "os";
import fs from "fs";
import log from "electron-log";
import { MinecraftProfile } from "../renderer/profiles";
import { MinecraftAccount } from "../renderer/accounts";
import { removeSuffix } from "../tools/strings";
import { analyzeLibrary } from "./libraries";

const OPERATING_SYSTEM = os.platform();
const OPERATING_VERSION = os.release();
// logger for minecraft launch core
export const lc = log.scope("core");
const lm = log.scope("minecraft");

export interface MinecraftLaunchDetail {
  text: string;
  stat: boolean;
}

export interface MinecraftLaunchOptions {
  account: MinecraftAccount;
  profile: MinecraftProfile;
  java: string;
  setDetails: (details: MinecraftLaunchDetail[]) => void;
  setHelper: (text: string) => void;
  onDone: () => void;
}

export function launchMinecraft(options: MinecraftLaunchOptions): void {
  lc.info("Launching Minecraft... ...");
  const account = options.account;
  const profile = options.profile;
  const java = options.java;
  const details: MinecraftLaunchDetail[] = [{ stat: true, text: "Authenticating" }];
  const onDone = options.onDone;
  const setDetails = options.setDetails;
  const setHelper = options.setHelper;

  setHelper("Launching Minecraft");

  function useMinecraftLaunchDetail(text: string): [MinecraftLaunchDetail, () => void] {
    const det = {
      stat: false,
      text,
    };
    details.push(det);
    setDetails(details);
    return [
      det, // detail
      () => {
        setDetails(
          details.map((value, index) => {
            if (value.text === text) {
              details[index].stat = true;
              return {
                stat: true,
                text: value.text,
              };
            } else {
              return value;
            }
          })
        );
      }, // doneDetail
    ];
  }

  const [_analyzeJson, doneAnalyzeJson] = useMinecraftLaunchDetail("Analyze JSON");

  const dir = removeSuffix(profile["dir"], "/");
  const data = fs.readFileSync(`${dir}/versions/${profile.ver}/${profile.ver}.json`);
  const parsed = JSON.parse(data.toString());
  const buff = [];
  const clientJar = `${dir}/versions/${profile.ver}/${profile.ver}.jar`;
  if (parsed.hasOwnProperty("arguments")) {
    // 1.13, 1.13+
    if (OPERATING_SYSTEM === "darwin") {
      // macos
      buff.push("-XstartOnFirstThread", "-Xdock:name=Minecraft");
    } else if (OPERATING_SYSTEM === "win32") {
      // windows
      buff.push(
        "-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump"
      );
      if (OPERATING_VERSION.startsWith("10")) {
        // windows 10
        buff.push("-Dos.name=Windows 10", "-Dos.version=10.0");
      }
    }
    buff.push("-Xss1M");
  } else {
    // 1.12, 1.12-
    buff.push(`-Dminecraft.client.jar=${clientJar}`);
  }
  const nativeDir = `${dir}/versions/${profile.ver}/${profile.ver}-natives`;
  try {
    fs.accessSync(nativeDir);
  } catch (e) {
    fs.mkdirSync(nativeDir);
  }
  buff.push(
    `-Djava.library.path=${nativeDir}`,
    `-Dminecraft.launcher.brand=Epherome`,
    `-Dminecraft.launcher.version=${process.env.npm_package_version}`
  );
  const obj = analyzeLibrary(dir, parsed["libraries"]);

  doneAnalyzeJson();
  // finished

  // start to download missing assets
  lc.info("start to download missing assets and libraries");

  const [_download, doneDownload] = useMinecraftLaunchDetail(
    "Download missing assets and libraries"
  );
  // TODO downloading missing assets and libraries
  doneDownload();

  // start to unzip native libraries
  lc.info("start to unzip native libraries");

  const [_unzip, doneUnzip] = useMinecraftLaunchDetail("Unzipping");

  const nativeLibs = obj["nativeLibs"];
  for (const i in nativeLibs) {
    const file = nativeLibs[i];
    const zip = new StreamZip({
      file: file,
      storeEntries: true,
    });
    zip.on("ready", () => {
      zip.extract(null, nativeDir, (err, count) => {
        zip.close();
        if (err) {
          lc.error(`Error Occurred in Unzipping File "${file}". Unzipped ${count} Files.`);
        }
      });
    });
  }

  doneUnzip();

  const cp = obj["cp"];
  cp.push(clientJar);
  buff.push("-cp", OPERATING_SYSTEM === "win32" ? cp.join(";") : cp.join(":"));

  // push main class
  buff.push(parsed["mainClass"]);

  // push minecraft arguments
  buff.push(
    "--username",
    account.name,
    "--version",
    profile.ver,
    "--gameDir",
    dir,
    "--assetsDir",
    `${dir}/assets`,
    "--assetIndex",
    parsed["assetIndex"]["id"],
    "--uuid",
    account.uuid,
    "--accessToken",
    account.token,
    "--userType",
    "mojang",
    "--versionType",
    parsed["type"]
  );

  useMinecraftLaunchDetail("Running");

  let firstTimeToReceiveStdout = true;

  // start minecraft

  const minecraftProcess = spawn(java, buff, {
    cwd: dir,
  });

  minecraftProcess.stdout.on("data", (data) => {
    if (firstTimeToReceiveStdout) {
      firstTimeToReceiveStdout = false;
      onDone();
    }
    lm.debug(data.toString());
  });
  minecraftProcess.stderr.on("data", (data) => {
    lm.error(data.toString());
  });
  minecraftProcess.on("exit", (code: number) => {
    lc.debug("Minecraft process exit, exit code:" + code);
  });
}