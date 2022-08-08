import { getRamCost } from "./RamCostGenerator";
import type { WorkerScript } from "./WorkerScript";
import { Player } from "../Player";
import { helpers } from "./NetscriptHelpers";

type ExternalFunction = (...args: unknown[]) => unknown;
export type ExternalAPI = {
  [string: string]: ExternalAPI | ExternalFunction;
};

type InternalFunction<F extends (...args: unknown[]) => unknown> = (ctx: NetscriptContext) => F;

export type InternalAPI<API> = {
  [Property in keyof API]: API[Property] extends ExternalFunction
    ? InternalFunction<API[Property]>
    : API[Property] extends object
    ? InternalAPI<API[Property]>
    : never;
};

type WrappedNetscriptFunction = (...args: unknown[]) => unknown;
type WrappedNetscriptAPI = {
  readonly [string: string]: WrappedNetscriptAPI | WrappedNetscriptFunction;
};

export type NetscriptContext = {
  workerScript: WorkerScript;
  function: string;
  functionPath: string;
};

function wrapFunction(
  wrappedAPI: ExternalAPI,
  workerScript: WorkerScript,
  func: (_ctx: NetscriptContext) => (...args: unknown[]) => unknown,
  ...tree: string[]
): void {
  const functionPath = tree.join(".");
  const functionName = tree.pop();
  if (typeof functionName !== "string") {
    throw helpers.makeRuntimeRejectMsg(workerScript, "Failure occured while wrapping netscript api");
  }
  const ctx = {
    workerScript,
    function: functionName,
    functionPath,
  };
  function wrappedFunction(...args: unknown[]): unknown {
    helpers.checkEnvFlags(ctx);
    helpers.updateDynamicRam(ctx, getRamCost(Player, ...tree, ctx.function));
    return func(ctx)(...args);
  }
  const parent = getNestedProperty(wrappedAPI, tree);
  Object.defineProperty(parent, functionName, {
    value: wrappedFunction,
    writable: true,
    enumerable: true,
  });
}

export function wrapAPI(
  wrappedAPI: ExternalAPI,
  workerScript: WorkerScript,
  namespace: object,
  ...tree: string[]
): WrappedNetscriptAPI {
  for (const [key, value] of Object.entries(namespace)) {
    if (typeof value === "function") {
      wrapFunction(wrappedAPI, workerScript, value, ...tree, key);
    } else if (Array.isArray(value)) {
      setNestedProperty(wrappedAPI, value.slice(), key);
    } else if (typeof value === "object") {
      wrapAPI(wrappedAPI, workerScript, value, ...tree, key);
    } else {
      setNestedProperty(wrappedAPI, value, ...tree, key);
    }
  }
  return wrappedAPI;
}

function setNestedProperty(root: any, value: unknown, ...tree: string[]): void {
  let target = root;
  const key = tree.pop();
  if (!key) throw new Error("Failure occured while wrapping netscript api (setNestedProperty)");
  for (const branch of tree) {
    target[branch] ??= {};
    target = target[branch];
  }
  target[key] = value;
}

function getNestedProperty(root: any, tree: string[]): unknown {
  let target = root;
  for (const branch of tree) {
    target[branch] ??= {};
    target = target[branch];
  }
  return target;
}
