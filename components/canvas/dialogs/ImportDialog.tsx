"use client";

import * as React from "react";
import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Import } from "lucide-react";
import type { Code, CodeGroup } from "../types";
import { Modal } from "@/components/ui/modal";

interface ImportDialogProps {
  codes: Code[];
  codeGroups: CodeGroup[];
  onImport: (codes: Code[], groups: CodeGroup[]) => void;
}

export function ImportDialog({
  codes,
  codeGroups,
  onImport,
}: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        if (fileExtension === "xml") {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(
            e.target?.result as string,
            "text/xml"
          );

          // Validate XML structure
          const project = xmlDoc.documentElement;
          if (
            project.nodeName !== "Project" ||
            project.getAttribute("xmlns") !== "urn:QDA-XML:project:1.0"
          ) {
            throw new Error("Invalid XML format");
          }

          // Import code groups
          const importedGroups: CodeGroup[] = [];
          const codeGroupsElement = project.querySelector("CodeGroups");
          if (codeGroupsElement) {
            const groups = Array.from(codeGroupsElement.children);
            groups.forEach((group) => {
              importedGroups.push({
                id: group.getAttribute("guid") || "",
                name: group.getAttribute("name") || "",
              });
            });
          }

          // Import codes
          const importedCodes: Code[] = [];
          const codesElement = project.querySelector("Codes");
          if (codesElement) {
            const codeElements = Array.from(codesElement.children);
            codeElements.forEach((codeElement) => {
              const groupRef = codeElement.querySelector("CodeGroupRef");
              const groupId = groupRef?.getAttribute("targetGuid");
              importedCodes.push({
                id: codeElement.getAttribute("guid") || "",
                name: codeElement.getAttribute("name") || "",
                color: codeElement.getAttribute("color") || "#000000",
                comment: "",
                groupId: groupId || undefined,
              });
            });
          }

          onImport(importedCodes, importedGroups);
        } else if (fileExtension === "xlsx") {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          }) as string[][];

          // Validate Excel structure
          const headers = jsonData[0];
          if (
            !headers ||
            headers[0] !== "Name" ||
            headers[1] !== "Color" ||
            headers[2] !== "Description" ||
            headers[3] !== "CodeGroup ID" ||
            headers[4] !== "CodeGroup Name"
          ) {
            console.log(headers);
            throw new Error("Invalid Excel format");
          }

          // Import data
          const rows = jsonData.slice(1);
          const importedGroups = new Map<string, CodeGroup>();
          const importedCodes: Code[] = [];

          // First pass: Create groups
          rows.forEach((row) => {
            const groupId = row[3];
            const groupName = row[4];
            if (groupId && groupName && !importedGroups.has(groupId)) {
              importedGroups.set(groupId, {
                id: groupId,
                name: groupName,
              });
            }
          });

          // Second pass: Create codes
          rows.forEach((row) => {
            const [name, color, description, groupId] = row;
            if (name) {
              importedCodes.push({
                id: crypto.randomUUID(),
                name,
                color: color || "#000000",
                comment: description || "",
                groupId: groupId || undefined,
              });
            }
          });

          onImport(importedCodes, Array.from(importedGroups.values()));
        } else {
          throw new Error("Unsupported file format");
        }
        setOpen(false);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "An error occurred while importing the file."
        );
      }
    };

    if (fileExtension === "xlsx") {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="outline"
          size="icon"
          tooltip="Import"
          tooltipSide="right"
        >
          <Import className="w-4 h-4" />
        </Button>
      }
      title="Import Codebook"
      description="Import a codebook from a previously exported file."
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Select File</Label>
          <Input type="file" accept=".xml,.xlsx" onChange={handleImport} />
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        <div className="text-sm text-muted-foreground">
          <p>Supported formats:</p>
          <ul className="list-disc pl-4 mt-1">
            <li>REFI-QDA XML (.xml) - Exported from this application</li>
            <li>Excel (.xlsx) - Exported from this application</li>
          </ul>
          <p className="mt-2">
            Note: Importing will replace all existing codes and groups.
          </p>
        </div>
      </div>
    </Modal>
  );
}
