import {
  Check,
  Code2,
  Copy,
  Edit3,
  FileText,
  Folder,
  Play,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { ScrollArea } from "./components/ui/scroll-area";
import { Textarea } from "./components/ui/textarea";
import { CodeHighlighter } from "./components/CodeHighlighter";
import { convertTsToScala } from "./converter";

interface SampleFile {
  name: string;
  tsContent: string;
  scalaContent: string;
}

// List of sample files from the samples directory
const SAMPLE_FILE_NAMES = [
  "abstract",
  "booleanlit",
  "comma",
  "duplicateliteraltypes",
  "enum",
  "export",
  "exportidentifier",
  "extendsintersection",
  "extendsobject",
  "generics",
  "import",
  "indexabletypes",
  "intersectiontype",
  "jsglobal",
  "keyof",
  "modifiers",
  "nametranslation",
  "nestedobjectliteraltypes",
  "never",
  "numberlit",
  "objectlit",
  "overrides",
  "stringlit",
  "then",
  "thistype",
  "uniontype",
];

function App() {
  const [sampleFiles, setSampleFiles] = useState<SampleFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<SampleFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<"samples" | "custom">("samples");
  const [customTsContent, setCustomTsContent] = useState("");
  const [customScalaContent, setCustomScalaContent] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [copyStates, setCopyStates] = useState<{
    ts: "idle" | "copying" | "copied" | "error";
    scala: "idle" | "copying" | "copied" | "error";
  }>({ ts: "idle", scala: "idle" });

  useEffect(() => {
    const loadSampleFiles = async () => {
      const files: SampleFile[] = [];

      for (const fileName of SAMPLE_FILE_NAMES) {
        try {
          // Load TypeScript declaration file
          const tsResponse = await fetch(`/samples/${fileName}.d.ts`);
          const tsContent = await tsResponse.text();

          // Load corresponding Scala file (if it exists)
          let scalaContent = "";
          try {
            const scalaResponse = await fetch(
              `/samples/${fileName}.d.ts.scala`
            );
            scalaContent = await scalaResponse.text();
          } catch {
            // If no pre-generated Scala file exists, we'll generate it on demand
            scalaContent =
              "// Scala code will be generated when this file is selected";
          }

          files.push({
            name: fileName,
            tsContent,
            scalaContent,
          });
        } catch (error) {
          console.error(`Failed to load ${fileName}:`, error);
          // Add placeholder for files that fail to load
          files.push({
            name: fileName,
            tsContent: `// Failed to load ${fileName}.d.ts`,
            scalaContent: `// Failed to load ${fileName}.d.ts.scala`,
          });
        }
      }

      setSampleFiles(files);
      setIsLoading(false);
    };

    loadSampleFiles();
  }, []);

  const handleFileSelect = async (file: SampleFile) => {
    setSelectedFile(file);

    // Generate Scala code using the converter if we don't have pre-generated content
    if (file.scalaContent.includes("Scala code will be generated")) {
      try {
        const generatedScala = convertTsToScala(file.tsContent, file.name);
        setSelectedFile({
          ...file,
          scalaContent: generatedScala,
        });
      } catch (error) {
        console.error("Failed to convert TypeScript to Scala:", error);
        setSelectedFile({
          ...file,
          scalaContent: `// Error generating Scala code:\n// ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        });
      }
    }
  };

  const copyToClipboard = async (
    text: string,
    type: "TypeScript" | "Scala"
  ) => {
    const stateKey = type === "TypeScript" ? "ts" : "scala";

    // Set copying state
    setCopyStates((prev) => ({ ...prev, [stateKey]: "copying" }));

    try {
      await navigator.clipboard.writeText(text);
      // Set copied state
      setCopyStates((prev) => ({ ...prev, [stateKey]: "copied" }));

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setCopyStates((prev) => ({ ...prev, [stateKey]: "idle" }));
      }, 2000);
    } catch (error) {
      console.error(`Failed to copy ${type} to clipboard:`, error);
      // Set error state
      setCopyStates((prev) => ({ ...prev, [stateKey]: "error" }));

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setCopyStates((prev) => ({ ...prev, [stateKey]: "idle" }));
      }, 2000);
    }
  };

  const handleCustomConvert = async () => {
    if (!customTsContent.trim()) return;

    setIsConverting(true);
    try {
      const generatedScala = convertTsToScala(customTsContent, "custom");
      setCustomScalaContent(generatedScala);
    } catch (error) {
      console.error("Failed to convert custom TypeScript to Scala:", error);
      setCustomScalaContent(
        `// Error generating Scala code:\n// ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsConverting(false);
    }
  };

  const handleModeSwitch = (newMode: "samples" | "custom") => {
    setMode(newMode);
    if (newMode === "custom") {
      setSelectedFile(null);
    }
  };

  const renderCopyButton = (text: string, type: "TypeScript" | "Scala") => {
    const stateKey = type === "TypeScript" ? "ts" : "scala";
    const state = copyStates[stateKey];

    const getButtonContent = () => {
      switch (state) {
        case "copying":
          return <Copy className="h-4 w-4" />;
        case "copied":
          return <Check className="h-4 w-4" />;
        case "error":
          return <Copy className="h-4 w-4" />;
        default:
          return <Copy className="h-4 w-4" />;
      }
    };

    const getButtonTitle = () => {
      switch (state) {
        case "copying":
          return "Copying...";
        case "copied":
          return "Copied!";
        case "error":
          return "Failed to copy";
        default:
          return `Copy ${type}`;
      }
    };

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => copyToClipboard(text, type)}
        className="h-8 px-2"
        disabled={state === "copying"}
        title={getButtonTitle()}
      >
        {getButtonContent()}
      </Button>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading sample files...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              ScalaJS TypeScript Converter
            </h1>
            <p className="text-slate-600 mt-1 text-sm">
              Convert TypeScript declaration files to Scala.js bindings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={mode === "samples" ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeSwitch("samples")}
              className="gap-2"
            >
              <Folder className="h-4 w-4" />
              Samples
            </Button>
            <Button
              variant={mode === "custom" ? "default" : "outline"}
              size="sm"
              onClick={() => handleModeSwitch("custom")}
              className="gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Custom
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 grid grid-cols-3 gap-1 p-1 overflow-hidden min-h-0">
        {/* Column 1: File List / Mode Selector */}
        <Card className="flex flex-col min-h-0">
          <CardHeader className="flex-shrink-0 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {mode === "samples" ? (
                <>
                  <Folder className="h-5 w-5 text-amber-600" />
                  Sample Files
                  <Badge variant="secondary" className="ml-auto">
                    {sampleFiles.length}
                  </Badge>
                </>
              ) : (
                <>
                  <Edit3 className="h-5 w-5 text-emerald-600" />
                  Custom Input
                  <Badge variant="secondary" className="ml-auto">
                    EDIT
                  </Badge>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            {mode === "samples" ? (
              <ScrollArea className="h-full">
                <div className="p-4 space-y-1">
                  {sampleFiles.map((file) => (
                    <Button
                      key={file.name}
                      variant={
                        selectedFile?.name === file.name ? "default" : "ghost"
                      }
                      className="w-full justify-start text-left h-auto py-3 px-3"
                      onClick={() => handleFileSelect(file)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span className="truncate text-sm">
                            {file.name}.d.ts
                          </span>
                        </div>
                        <Badge
                          variant={
                            selectedFile?.name === file.name
                              ? "secondary"
                              : "outline"
                          }
                          className="ml-2 text-xs flex-shrink-0"
                        >
                          TS
                        </Badge>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-full p-4 flex flex-col gap-3">
                <div className="text-sm text-slate-600">
                  Enter your TypeScript declaration code below:
                </div>
                <Textarea
                  placeholder="// Enter TypeScript declaration code here
interface MyInterface {
  property: string;
}

declare module 'my-module' {
  export function myFunction(): void;
}"
                  value={customTsContent}
                  onChange={(e) => setCustomTsContent(e.target.value)}
                  className="flex-1 min-h-0 resize-none font-mono text-sm"
                />
                <Button
                  onClick={handleCustomConvert}
                  disabled={!customTsContent.trim() || isConverting}
                  className="w-full gap-2"
                  size="sm"
                >
                  {isConverting ? (
                    <>
                      <Zap className="h-4 w-4 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Convert to Scala
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Column 2: TypeScript Content */}
        <Card className="flex flex-col min-h-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 flex-shrink-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              TypeScript Declaration
              {mode === "samples" && selectedFile && (
                <Badge variant="outline" className="ml-2">
                  {selectedFile.name}.d.ts
                </Badge>
              )}
              {mode === "custom" && (
                <Badge variant="outline" className="ml-2">
                  custom.d.ts
                </Badge>
              )}
            </CardTitle>
            {((mode === "samples" && selectedFile) ||
              (mode === "custom" && customTsContent)) &&
              renderCopyButton(
                mode === "samples"
                  ? selectedFile?.tsContent || ""
                  : customTsContent,
                "TypeScript"
              )}
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="relative h-full px-4">
                {(mode === "samples" && selectedFile?.tsContent) || (mode === "custom" && customTsContent) ? (
                  <CodeHighlighter
                    code={mode === "samples" ? selectedFile?.tsContent || "" : customTsContent}
                    language="typescript"
                  />
                ) : (
                  <div className="p-4 text-sm font-mono bg-slate-50 text-slate-800 whitespace-pre-wrap min-h-full">
                    <span className="text-slate-500 italic">
                      {mode === "samples"
                        ? "Select a file to view its TypeScript content"
                        : "Enter TypeScript code in the left panel to see it here"}
                    </span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Column 3: Generated Scala Content */}
        <Card className="flex flex-col min-h-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 flex-shrink-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Code2 className="h-5 w-5 text-green-600" />
              Generated Scala Code
              {mode === "samples" && selectedFile && (
                <Badge variant="outline" className="ml-2">
                  {selectedFile.name}.scala
                </Badge>
              )}
              {mode === "custom" && customScalaContent && (
                <Badge variant="outline" className="ml-2">
                  custom.scala
                </Badge>
              )}
            </CardTitle>
            {((mode === "samples" && selectedFile) ||
              (mode === "custom" && customScalaContent)) &&
              renderCopyButton(
                mode === "samples"
                  ? selectedFile?.scalaContent || ""
                  : customScalaContent,
                "Scala"
              )}
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="relative h-full px-4">
                {(mode === "samples" && selectedFile?.scalaContent && !selectedFile.scalaContent.includes("Scala code will be generated")) || 
                 (mode === "custom" && customScalaContent) ? (
                  <CodeHighlighter
                    code={mode === "samples" ? selectedFile?.scalaContent || "" : customScalaContent}
                    language="scala"
                  />
                ) : (
                  <div className="p-4 text-sm font-mono bg-slate-50 text-slate-800 whitespace-pre-wrap min-h-full">
                    <span className="text-slate-500 italic">
                      {mode === "samples"
                        ? "Select a file to view the generated Scala code"
                        : customTsContent
                        ? 'Click "Convert to Scala" to generate the Scala bindings'
                        : "Enter TypeScript code and click convert to see the generated Scala code"}
                    </span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
