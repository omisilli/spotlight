"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { initSpotlight } from "@plusguard/spotlight";
import "@plusguard/spotlight/index.css";

/* Mount once, high in the tree. Logos rendered later — another route, a
   section loaded on demand — are lit too. Lenis or not makes no
   difference: the light follows the page however it scrolls. */
export function Spotlights() {
    useEffect(() => initSpotlight(), []);
    return null;
}

/*
 * Four footers, as the static example has them. The logo is written once,
 * inside data-pg-spotlight; the script adds the lit copy beside it after
 * hydration, so the server's HTML and the browser's agree.
 *
 * Its look is CSS — set it anywhere above the logo, media queries welcome:
 *
 *   .bugatti {                       bugatti.com's: dark until found
 *       --pg-spotlight-base: 0;
 *       --pg-spotlight-lit: 0.4;
 *   }
 *   .bugatti[data-light="small"] { --pg-spotlight-lit: 0.6; }
 *   [data-light="wide"] {            the light as wide as the logo,
 *       --pg-spotlight-size: 0%;     fading all the way — without it,
 *       --pg-spotlight-fade: 60%;    the package's small circle
 *   }
 *   [data-light="wide-dark"] {       and dark: bugatti.com's
 *       --pg-spotlight-base: 0;
 *       --pg-spotlight-lit: 0.4;
 *       --pg-spotlight-size: 0%;
 *       --pg-spotlight-fade: 60%;
 *   }
 *   .flush {                         edge to edge, on the page's bottom
 *       margin-inline: calc(-1 * var(--footer-padding));
 *       overflow: hidden;
 *   }
 *   .flush > * { margin-bottom: -1%; }
 *
 * On a touch screen there is no light, so a logo is hidden unless it has
 * data-pg-spotlight-touch, which keeps it at --pg-spotlight-touch. Here
 * all stay but Gaga's.
 *
 *   The Gaga logo's metal comes from the page, to turn with light and dark:
 *   .gaga stop:nth-child(1) { stop-color: var(--metal-1); } … (6 stops)
 */

/* The light's shapes, for one footer — the buttons it offers, the first
   one pressed to start. */
type Light = "small" | "wide" | "wide-dark";
function LightSwitch({ light, set, choices }: { light: Light; set: (l: Light) => void; choices: [Light, string][] }) {
    return (
        <div role="group" aria-label="The light">
            {choices.map(([value, label]) => (
                <button key={value} type="button" aria-pressed={light === value} onClick={() => set(value)}>
                    {label}
                </button>
            ))}
        </div>
    );
}

/*
 * Every option on one logo — the playground. Each pick sets the box; the
 * CSS for what is picked is written below it. None of it needs more than
 * CSS: variables on the box, and the lit copy styled through
 * [data-pg-spotlight-lit]:
 *
 *   .play[data-colour="brand"]   { --pg-spotlight-color: #ff0033; }
 *   .play[data-colour="gold"] > [data-pg-spotlight-lit] { fill: #e0b34a; }
 *   .play[data-colour="outline"] > svg:not([data-pg-spotlight-lit]) { filter: none; }
 *   .play[data-colour="outline"] > svg:not([data-pg-spotlight-lit]) path {
 *       fill: none; stroke: currentColor; stroke-width: 1px; vector-effect: non-scaling-stroke;
 *   }
 *   .play[data-blend="on"] > [data-pg-spotlight-lit] { mix-blend-mode: screen; }
 */
const BASE = { dim: "0.4", ghost: "0.12", dark: "0" };
const SHAPE = {
    "small soft": ["160px", "420px"],
    "small hard": ["200px", "210px"],
    "wide soft": ["0%", "60%"],
    "wide hard": ["45%", "47%"],
} as const;
const GROUPS = {
    base: ["Without the light", [["dim", "Dim — 0.4"], ["ghost", "A ghost — 0.12"], ["dark", "Dark — 0"]]],
    light: ["The light", [["small", "A small circle"], ["wide", "Wide and soft"]]],
    edge: ["Its edge", [["soft", "Soft"], ["hard", "Hard — a torch"]]],
    lit: ["In the light", [["0.4", "0.4"], ["0.6", "0.6"], ["0.85", "0.85"]]],
    colour: ["Colour", [["text", "The text colour"], ["brand", "A brand colour"], ["gold", "Gold in the light"], ["outline", "An outline, filled by the light"]]],
    grain: ["Grain", [["on", "On"], ["off", "Off"]]],
    blend: ["Blend", [["off", "Off"], ["on", "The light blends with the logo"]]],
} as const;
type Pick = { [K in keyof typeof GROUPS]: string };

export function Playground() {
    const [pick, setPick] = useState<Pick>({
        base: "dim",
        light: "small",
        edge: "soft",
        lit: "0.6",
        colour: "text",
        grain: "on",
        blend: "off",
    });
    const [size, fade] = SHAPE[`${pick.light} ${pick.edge}` as keyof typeof SHAPE];
    const vars = {
        "--pg-spotlight-base": BASE[pick.base as keyof typeof BASE],
        "--pg-spotlight-lit": pick.lit,
        "--pg-spotlight-size": size,
        "--pg-spotlight-fade": fade,
    };

    const css = [".logo {", ...Object.entries(vars).map(([k, v]) => `    ${k}: ${v};`)];
    if (pick.colour === "brand") css.push("    --pg-spotlight-color: #ff0033;");
    css.push("}");
    if (pick.colour === "gold") css.push(".logo > [data-pg-spotlight-lit] {", "    fill: #e0b34a;", "}");
    if (pick.colour === "outline")
        css.push(
            ...(pick.grain === "on" ? [".logo > svg:not([data-pg-spotlight-lit]) {", "    filter: none; /* a thin line is lost in the grain */", "}"] : []),
            ".logo > svg:not([data-pg-spotlight-lit]) path {",
            "    fill: none;",
            "    stroke: currentColor;",
            "    stroke-width: 1px;",
            "    vector-effect: non-scaling-stroke;",
            "}",
        );
    if (pick.blend === "on") css.push(".logo > [data-pg-spotlight-lit] {", "    mix-blend-mode: screen; /* multiply on a light page */", "}");
    css.push("", `<div class="logo" data-pg-spotlight${pick.grain === "on" ? " data-pg-spotlight-grain" : ""}>…</div>`);

    return (
        <footer>
            <h2>PlusGuard — every option · shown on phones</h2>
            {(Object.keys(GROUPS) as (keyof typeof GROUPS)[]).map((group) => (
                <fieldset key={group}>
                    <legend>{GROUPS[group][0]}</legend>
                    {GROUPS[group][1].map(([value, label]) => (
                        <button
                            key={value}
                            type="button"
                            aria-pressed={pick[group] === value}
                            onClick={() => setPick({ ...pick, [group]: value })}
                        >
                            {label}
                        </button>
                    ))}
                </fieldset>
            ))}
            <pre>{css.join("\n")}</pre>
            {/* The grain attribute comes and goes with the pick: index.css
                reads it, so it takes effect at once. */}
            <div
                className="play on-bottom"
                style={vars as CSSProperties}
                data-colour={pick.colour}
                data-blend={pick.blend}
                data-pg-spotlight
                data-pg-spotlight-grain={pick.grain === "on" ? "" : undefined}
                data-pg-spotlight-touch
            >
                {/* "PlusGuard" in Roboto Black, tight, drawn as a path. */}
                <svg viewBox="10.74 -150 881.88 151.95" role="img" aria-label="PlusGuard">
                    <path d="M66.89-48.24L45.02-48.24L45.02 0L10.74 0L10.74-142.19L67.48-142.19Q83.79-142.19 96.34-136.18Q108.89-130.18 115.77-119.09Q122.66-108.01 122.66-93.95L122.66-93.95Q122.66-73.14 107.76-60.69Q92.87-48.24 66.89-48.24L66.89-48.24ZM45.02-115.72L45.02-74.71L67.48-74.71Q77.44-74.71 82.67-79.69Q87.89-84.67 87.89-93.75L87.89-93.75Q87.89-103.71 82.52-109.67Q77.15-115.63 67.87-115.72L67.87-115.72L45.02-115.72ZM169.12-150L169.12 0L136.11 0L136.11-150L169.12-150ZM248.30 0L247.32-11.43Q236.88 1.95 219.10 1.95L219.10 1.95Q201.72 1.95 192.78-8.15Q183.85-18.26 183.85-37.21L183.85-37.21L183.85-105.66L216.76-105.66L216.76-37.01Q216.76-23.44 229.94-23.44L229.94-23.44Q241.27-23.44 246.05-31.54L246.05-31.54L246.05-105.66L279.16-105.66L279.16 0L248.30 0ZM347.50-29.69L347.50-29.69Q347.50-33.89 343.11-36.43Q338.71-38.96 326.41-41.70Q314.10-44.43 306.09-48.88Q298.09-53.32 293.89-59.67Q289.69-66.02 289.69-74.22L289.69-74.22Q289.69-88.77 301.70-98.19Q313.71-107.62 333.14-107.62L333.14-107.62Q354.04-107.62 366.74-98.14Q379.43-88.67 379.43-73.24L379.43-73.24L346.43-73.24Q346.43-85.94 333.05-85.94L333.05-85.94Q327.87-85.94 324.36-83.06Q320.84-80.18 320.84-75.88L320.84-75.88Q320.84-71.48 325.14-68.75Q329.43-66.02 338.86-64.26Q348.28-62.50 355.41-60.06L355.41-60.06Q379.24-51.86 379.24-30.66L379.24-30.66Q379.24-16.21 366.40-7.13Q353.55 1.95 333.14 1.95L333.14 1.95Q319.57 1.95 308.93-2.93Q298.28-7.81 292.32-16.21Q286.37-24.61 286.37-33.89L286.37-33.89L317.13-33.89Q317.32-26.56 322.01-23.19Q326.70-19.82 334.02-19.82L334.02-19.82Q340.76-19.82 344.13-22.56Q347.50-25.29 347.50-29.69ZM507.54-75.98L507.54-17.58Q499.63-8.79 484.39-3.42Q469.16 1.95 451.00 1.95L451.00 1.95Q423.07 1.95 406.37-15.14Q389.67-32.23 388.50-62.70L388.50-62.70L388.40-75Q388.40-96.00 395.82-111.67Q403.24-127.34 417.06-135.79Q430.88-144.24 449.04-144.24L449.04-144.24Q475.61-144.24 490.30-132.08Q505-119.92 507.44-95.80L507.44-95.80L474.43-95.80Q472.68-107.71 466.82-112.79Q460.96-117.87 450.21-117.87L450.21-117.87Q437.32-117.87 430.29-106.93Q423.26-96.00 423.16-75.68L423.16-75.68L423.16-67.09Q423.16-45.80 430.44-35.11Q437.71-24.41 453.34-24.41L453.34-24.41Q466.72-24.41 473.26-30.37L473.26-30.37L473.26-52.44L449.43-52.44L449.43-75.98L507.54-75.98ZM584.86 0L583.89-11.43Q573.44 1.95 555.66 1.95L555.66 1.95Q538.28 1.95 529.35-8.15Q520.41-18.26 520.41-37.21L520.41-37.21L520.41-105.66L553.32-105.66L553.32-37.01Q553.32-23.44 566.50-23.44L566.50-23.44Q577.83-23.44 582.62-31.54L582.62-31.54L582.62-105.66L615.72-105.66L615.72 0L584.86 0ZM721.17 0L688.26 0Q686.50-3.22 685.14-9.47L685.14-9.47Q676.05 1.95 659.75 1.95L659.75 1.95Q644.80 1.95 634.36-7.08Q623.91-16.11 623.91-29.79L623.91-29.79Q623.91-46.97 636.60-55.76Q649.30-64.55 673.52-64.55L673.52-64.55L683.67-64.55L683.67-70.12Q683.67-84.67 671.07-84.67L671.07-84.67Q659.36-84.67 659.36-73.14L659.36-73.14L626.45-73.14Q626.45-88.48 639.48-98.05Q652.52-107.62 672.73-107.62Q692.95-107.62 704.67-97.75Q716.39-87.89 716.68-70.70L716.68-70.70L716.68-23.93Q716.88-9.38 721.17-1.66L721.17-1.66L721.17 0ZM667.66-21.48L667.66-21.48Q673.81-21.48 677.86-24.12Q681.91-26.76 683.67-30.08L683.67-30.08L683.67-46.97L674.10-46.97Q656.91-46.97 656.91-31.54L656.91-31.54Q656.91-27.05 659.94-24.27Q662.97-21.48 667.66-21.48ZM794.39-106.45L793.81-75.88L782.97-76.66Q767.44-76.66 763.05-66.89L763.05-66.89L763.05 0L730.14 0L730.14-105.66L761.00-105.66L762.07-92.09Q770.37-107.62 785.21-107.62L785.21-107.62Q790.49-107.62 794.39-106.45L794.39-106.45ZM794.67-53.61L794.67-53.61Q794.67-78.71 805.51-93.16Q816.35-107.62 835.78-107.62L835.78-107.62Q849.94-107.62 859.61-96.48L859.61-96.48L859.61-150L892.62-150L892.62 0L863.03 0L861.37-11.33Q851.21 1.95 835.59 1.95L835.59 1.95Q816.74 1.95 805.70-12.50Q794.67-26.95 794.67-53.61ZM827.68-57.62L827.58-51.56Q827.58-23.44 843.98-23.44L843.98-23.44Q854.92-23.44 859.61-32.62L859.61-32.62L859.61-72.85Q855.12-82.23 844.18-82.23L844.18-82.23Q828.95-82.23 827.68-57.62L827.68-57.62Z" />
                </svg>
            </div>
        </footer>
    );
}

/* 1 · Gaga: its own metal gradient, grain, 40% showing (the default).
   Hidden on phones — the default, as the Gaga site had it. */
export function GagaFooter() {
    return (
        <footer>
            {/* … columns of links … */}
            <div className="gaga" data-pg-spotlight data-pg-spotlight-grain>
                <svg viewBox="0 0 1418.1 219.194" role="img" aria-label="Gaga">
                    <defs>
                        <linearGradient id="gaga-metal" x1="1.035" y1="0.5" x2="0" y2="0.5">
                            <stop offset="0" />
                            <stop offset="0.204" />
                            <stop offset="0.412" />
                            <stop offset="0.609" />
                            <stop offset="0.807" />
                            <stop offset="1" />
                        </linearGradient>
                    </defs>
                    <path fill="url(#gaga-metal)" transform="translate(-33.304 -61.763)" d="M933.694,280.957c-126.551,0-145.928-15.138-145.928-105.964v-4.844c0-93.248,20.588-108.386,145.322-108.386h15.744c93.248,0,107.175,3.633,107.175,26.037v7.266c0,12.11-7.266,16.954-19.376,16.954H928.85c-72.056,0-77.505,4.239-77.505,58.735v7.266c0,52.68,4.844,55.706,77.505,55.706h18.165c50.863,0,54.5-3.632,54.5-15.743V205.268c0-5.449-3.028-8.477-10.293-8.477h-55.1c-12.11,0-19.376-4.238-19.376-16.954v-9.082c0-12.11,7.266-16.954,19.376-16.954h94.46c24.22,0,32.7,9.082,32.7,27.247v22.4c0,56.312-6.66,77.505-111.413,77.505Zm-754.463,0C52.68,280.957,33.3,265.819,33.3,174.992v-4.844C33.3,76.9,53.891,61.763,178.626,61.763h15.743c93.248,0,107.176,3.633,107.176,26.037v7.266c0,12.11-7.267,16.954-18.771,16.954H174.992c-72.055,0-77.505,4.239-77.505,58.735v7.266c0,52.68,4.845,55.706,77.505,55.706h18.166c50.863,0,54.5-3.632,54.5-15.743V205.268c0-5.449-3.028-8.477-10.294-8.477h-55.1c-12.11,0-19.377-4.238-19.377-16.954v-9.082c0-12.11,7.267-16.954,19.377-16.954h94.459c24.221,0,32.7,9.082,32.7,27.247v23.009l-.606-.606c0,56.312-6.661,77.505-111.414,77.505Zm1224.338-1.817c-12.11,0-15.138-4.238-21.8-16.348l-7.871-14.532h.606c-3.028-6.055-5.45-7.871-13.321-7.871H1243.714c-7.871,0-10.293,1.211-13.321,7.871l-7.872,14.532c-6.66,13.322-9.688,16.348-22.4,16.348h-27.853c-10.9,0-17.56-5.449-17.56-13.927s1.211-7.871,3.633-12.11l97.487-176.2c5.449-9.689,10.293-13.322,21.192-13.322h50.863c10.9,0,15.744,3.633,21.193,13.322l98.7,176.2c2.422,4.844,3.633,8.477,3.633,12.11,0,9.083-7.871,13.927-17.56,13.927ZM1297,114.441l-34.514,69.028a15.791,15.791,0,0,0-1.816,6.661c0,3.028,2.422,5.45,7.871,5.45h69.028c5.449,0,7.871-2.422,7.871-5.45s-.606-3.633-1.816-6.661l-34.514-69.028H1307.9c-1.816-3.632-3.633-4.844-5.45-4.844S1298.816,110.809,1297,114.441Zm-648.5,164.7c-12.109,0-15.137-4.238-21.8-16.348l-7.871-14.532h.606c-3.028-6.055-5.449-7.871-13.322-7.871H488.646c-7.871,0-10.294,1.211-13.322,7.871l-7.871,14.532c-6.66,13.322-9.688,16.348-22.4,16.348H417.2c-10.9,0-17.56-5.449-17.56-13.927s1.211-7.871,3.633-12.11L500.756,76.9c5.45-9.689,10.294-13.322,21.193-13.322h50.863c10.9,0,15.744,3.633,21.193,13.322l98.7,176.2c2.422,4.844,3.633,8.477,3.633,12.11,0,9.083-7.872,13.927-17.56,13.927Zm-105.963-164.7-34.514,69.028a15.779,15.779,0,0,0-1.816,6.661c0,3.028,2.422,5.45,7.871,5.45H583.1c5.45,0,7.872-2.422,7.872-5.45s-.606-3.633-1.817-6.661l-34.514-69.028h-1.21c-1.816-3.632-3.633-4.844-5.45-4.844S544.352,110.809,542.536,114.441Zm520.736,89.01v0Z" />
                </svg>
            </div>
        </footer>
    );
}

/* 2 · Baibars: the text colour (currentColor), grain, 40% showing.
   Shown on phones. */
export function BaibarsFooter() {
    return (
        <footer>
            {/* … columns of links … */}
            <div data-pg-spotlight data-pg-spotlight-grain data-pg-spotlight-touch>
                <svg viewBox="0 0 1920.672 401.16" role="img" aria-label="Baibars">
                    <path d="M237.949,346.756a47.654,47.654,0,0,1-47.625,47.625H47.581V354.248L0,401.115V47.581L47.581,0V190.368l33.98-33.98H190.324a47.654,47.654,0,0,1,47.625,47.625V346.8Zm-47.581,6.778V197.146H47.581V353.535H190.368Z" />
                    <path transform="translate(250.489 121.249)" d="M310.4,273.088H262.823V238.395l-40.8,34.693H120.035A47.654,47.654,0,0,1,72.41,225.463V177.882a47.655,47.655,0,0,1,47.626-47.625H256L215.2,170.39H120.035v61.851H262.823V75.853H72.455l40.8-40.8H262.823a45.824,45.824,0,0,1,33.668,13.958,45.925,45.925,0,0,1,13.958,33.668V273.044Z" />
                    <path transform="translate(508.969 47.462)" d="M194.711,68.124H147.13V13.72h47.581Zm0,278.752H147.13V142.906l47.581-47.581Z" />
                    <path transform="translate(624.96)" d="M418.654,346.756a47.655,47.655,0,0,1-47.625,47.625H228.241V354.248L180.66,401.16V47.581L228.241,0V190.368l33.98-33.98H370.984a47.655,47.655,0,0,1,47.625,47.625V346.8Zm-47.581,6.778V197.146H228.286V353.535Z" />
                    <path transform="translate(875.484 121.249)" d="M491.074,273.088H443.493V238.395l-40.8,34.693H300.706a47.578,47.578,0,0,1-47.581-47.625V177.882a47.578,47.578,0,0,1,47.581-47.625H436.67l-40.8,40.134H300.661v61.851H443.448V75.853H253.08l40.8-40.8H443.448a45.824,45.824,0,0,1,33.668,13.958,45.926,45.926,0,0,1,13.958,33.668V273.044Z" />
                    <path transform="translate(1133.964 121.284)" d="M518.124,130.266H470.543v-54.4H375.381V273.009H327.8V35.06h47.581V69.04l33.98-33.98h61.182A45.824,45.824,0,0,1,504.21,49.018a45.884,45.884,0,0,1,13.913,33.668v47.581Z" />
                    <path transform="translate(1331.733 121.318)" d="M588.939,35.07l-41.472,40.8H432.551v54.4h95.206A47.578,47.578,0,0,1,575.338,177.9v47.581a47.578,47.578,0,0,1-47.581,47.626H384.97v-40.8H527.757V171.124H432.551A47.578,47.578,0,0,1,384.97,123.5V82.7a45.956,45.956,0,0,1,13.913-33.668A45.925,45.925,0,0,1,432.551,35.07H588.939Z" />
                </svg>
            </div>
        </footer>
    );
}

/* 3 · Bugatti: dark until found, edge to edge, on the page's bottom — as
   bugatti.com's footer has it. The wordmark is drawn as a path for this
   example; BUGATTI is its owner's trademark. */
export function BugattiFooter() {
    // Its wide soft light, or a small circle — the same logo either way.
    const [light, setLight] = useState<Light>("wide");
    return (
        <footer>
            {/* … columns of links … */}
            <LightSwitch
                light={light}
                set={setLight}
                choices={[
                    ["wide", "Wide and soft — as bugatti.com"],
                    ["small", "A small circle, dark"],
                ]}
            />
            {/* Shown on phones too, at 0.2: dark until found is not lost there. */}
            <div
                className="bugatti flush"
                data-light={light}
                data-pg-spotlight
                data-pg-spotlight-grain
                data-pg-spotlight-touch
            >
                <svg viewBox="0 0 2468.89 566.93" role="img" aria-label="Bugatti">
                    <path d="M272.56 273.34c28.81-26.48 45.95-63.86 45.95-107.47 0-89.56-65.41-154.97-155.75-154.97H0v545.13h174.44c92.67 0 160.42-66.97 160.42-159.64 0-52.18-23.36-95.79-62.3-123.04ZM87.22 95.01h72.42c42.83 0 71.65 28.81 71.65 70.87s-28.81 70.87-71.65 70.87H87.22V95.01Zm84.1 376.91h-84.1V320.84h84.1c45.17 0 76.32 30.37 76.32 75.54s-31.15 75.54-76.32 75.54ZM648.69 406.51c0 44.39-31.93 76.32-76.32 76.32s-76.32-31.93-76.32-76.32V10.9h-87.22v389.38c0 96.56 68.53 166.65 163.54 166.65s163.54-70.09 163.54-166.65V10.9h-87.22v395.61ZM993.03 0c-95.01 0-163.54 70.09-163.54 166.65v233.62c0 96.56 68.53 166.65 163.54 166.65s163.54-70.09 163.54-166.65V241.41H993.03v84.11h76.32v80.99c0 44.39-31.93 76.32-76.32 76.32s-76.32-31.93-76.32-76.32V160.42c0-44.39 31.93-76.32 76.32-76.32s76.32 31.93 76.32 76.32v14.02h87.22v-7.79C1156.57 70.09 1088.04 0 993.03 0ZM1344.1 10.9l-125.38 545.12h86.44L1330.08 447h147.96l24.92 109.02h86.44L1464.03 10.9H1344.1Zm5.45 351.99 54.51-239.08 54.51 239.08h-109.02ZM1604.2 95.01h119.93l.78 461.02h85.66l.78-461.02h119.92V10.9H1604.2v84.11zM1976.59 95.01h119.93l.78 461.02h85.66l.78-461.02h119.92V10.9h-327.07v84.11zM2381.67 10.9h87.22v545.12h-87.22z" />
                </svg>
            </div>
        </footer>
    );
}

/* 4 · Set in a font: the same logo as <text>, in Roboto Black. Load the
   face as any other — next/font:
     const roboto = Roboto({ weight: "900", subsets: ["latin"], variable: "--font-roboto" });
   and use var(--font-roboto) below. Until it has loaded, a fallback
   stands in. */
export function FontFooter() {
    const [light, setLight] = useState<Light>("small");
    return (
        <footer>
            {/* … columns of links … */}
            <LightSwitch
                light={light}
                set={setLight}
                choices={[
                    ["small", "A small circle — the default"],
                    ["wide", "Wide and soft"],
                    ["wide-dark", "Wide, soft and dark — as bugatti.com"],
                ]}
            />
            {/* Shown on phones. On the page's bottom, uncut, within the side
                padding: .on-bottom { padding-bottom: 0 } — the viewBox ends
                where the letters do. It is the word's full width, so a
                slightly wider build of the font is not cut either. */}
            <div className="on-bottom" data-light={light} data-pg-spotlight data-pg-spotlight-grain data-pg-spotlight-touch>
                <svg viewBox="0 -150 898 152" role="img" aria-label="PlusGuard">
                    {/* style, not the font-family attribute: an attribute takes no var(). */}
                    <text style={{ fontFamily: "var(--font-roboto), Roboto, system-ui, sans-serif" }} fontWeight="900" fontSize="200" letterSpacing="-5">
                        PlusGuard
                    </text>
                </svg>
            </div>
        </footer>
    );
}
