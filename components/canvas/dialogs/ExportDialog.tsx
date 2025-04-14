"use client";

import * as React from "react";
import { useState } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download } from "lucide-react";
import type { Code, CodeGroup } from "../types";
import { Modal } from "@/components/ui/modal";

interface ExportDialogProps {
  codes: Code[];
  codeGroups: CodeGroup[];
}

export function ExportDialog({ codes, codeGroups }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"xml" | "excel">("xml");
  const [projectName, setProjectName] = useState("");
  const [authorName, setAuthorName] = useState("");

  const handleExport = () => {
    if (projectName.trim() === "" || authorName.trim() === "") {
      alert("Please enter a project name and author name before exporting.");
      return;
    }

    if (format === "xml") {
      const doc = document.implementation.createDocument(null, "Project", null);
      const project = doc.documentElement;

      // Add XML declaration
      const xmlDeclaration = doc.createProcessingInstruction(
        "xml",
        'version="1.0" encoding="UTF-8"'
      );
      doc.insertBefore(xmlDeclaration, project);

      // Set attributes
      project.setAttribute("xmlns", "urn:QDA-XML:project:1.0");
      project.setAttribute(
        "xmlns:xsi",
        "http://www.w3.org/2001/XMLSchema-instance"
      );
      project.setAttribute("name", projectName || "Exported Project");
      project.setAttribute("author", authorName || "Your Name");
      project.setAttribute("cDate", new Date().toISOString());
      project.setAttribute("origin", "Your App");

      const codeBook = doc.createElement("CodeBook");

      // Codes
      const codesElement = doc.createElement("Codes");

      codes.forEach((code) => {
        const codeElement = doc.createElement("Code");
        codeElement.setAttribute("isCodable", "true");
        codeElement.setAttribute("guid", code.id);
        codeElement.setAttribute("color", code.color);
        codeElement.setAttribute("name", code.name);

        if (code.comment) {
          const description = doc.createElement("Description");
          description.textContent = code.comment;
          codeElement.appendChild(description);
        }

        if (code.groupId) {
          const groupRef = doc.createElement("CodeGroupRef");
          groupRef.setAttribute("targetGuid", code.groupId);
          codeElement.appendChild(groupRef);
        }

        codesElement.appendChild(codeElement);
      });

      // CodeGroups
      const codeGroupsElement = doc.createElement("CodeGroups");

      codeGroups.forEach((group) => {
        const groupElement = doc.createElement("CodeGroup");
        groupElement.setAttribute("guid", group.id);
        groupElement.setAttribute("name", group.name);
        codeGroupsElement.appendChild(groupElement);
      });

      codeBook.appendChild(codesElement);
      codeBook.appendChild(codeGroupsElement);
      project.appendChild(codeBook);

      const serializer = new XMLSerializer();
      const xmlString = serializer.serializeToString(doc);
      const blob = new Blob([xmlString], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName || "exported_codebook"}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Create worksheet data
      const worksheetData = [
        ["Name", "Color", "Description", "CodeGroup ID", "CodeGroup Name"],
        ...codes.map((code) => {
          const group = code.groupId
            ? codeGroups.find((g) => g.id === code.groupId)
            : null;
          return [
            code.name,
            code.color,
            code.comment || "",
            code.groupId || "",
            group?.name || "",
          ];
        }),
      ];

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Codes");

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName || "exported_codebook"}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="outline"
          size="icon"
          tooltip="Export"
          tooltipSide="right"
        >
          <Download className="w-4 h-4" />
        </Button>
      }
      title="Export Codebook"
      description="Export your codebook in REFI-QDA XML or Excel format."
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Project Name</Label>
          <Input
            placeholder="Enter project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Author</Label>
          <Input
            placeholder="Enter author name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Export Format</Label>
          <RadioGroup
            value={format}
            onValueChange={(value) => setFormat(value as "xml" | "excel")}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="xml" id="xml" />
              <Label htmlFor="xml">REFI-QDA XML</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="excel" id="excel" />
              <Label htmlFor="excel">Excel</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleExport}>
            Export
          </Button>
        </div>
      </div>
    </Modal>
  );
}
