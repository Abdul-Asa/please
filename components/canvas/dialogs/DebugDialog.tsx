"use client";

import { Button } from "@/components/ui/button";
import { Bug, X, Play } from "lucide-react";
import { useCanvas } from "../useCanvas";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRoom, useStorage } from "@liveblocks/react";
import { MultiplayerDebug } from "../multiplayer/debug";

export function DebugDialog({ isMultiplayer }: { isMultiplayer?: boolean }) {
  const { canvas, controls } = useCanvas();
  const [isOpen, setIsOpen] = useState(true);

  const createDemoProject = () => {
    // Clear existing data
    canvas.nodes.forEach((node) => controls.deleteNode(node.id));
    canvas.codes.forEach((code) => controls.deleteCode(code.id));
    canvas.codeGroups.forEach((group) => controls.deleteCodeGroup(group.id));

    // Create code groups
    const webQdaGroup = controls.addCodeGroup({ name: "Web QDA Features" });
    const collaborationGroup = controls.addCodeGroup({ name: "Collaboration" });
    const aiGroup = controls.addCodeGroup({ name: "AI Assistance" });
    const uxGroup = controls.addCodeGroup({ name: "User Experience Feedback" });

    // Create codes
    const easeOfUseID = controls.addCode({
      name: "Ease of Use",
      color: "#FF5733",
      comment: "",
      groupId: webQdaGroup.id,
    }).id;

    const crossPlatformID = controls.addCode({
      name: "Cross-platform Access",
      color: "#33FF57",
      comment: "",
      groupId: webQdaGroup.id,
    }).id;

    const teamCodingID = controls.addCode({
      name: "Team Coding",
      color: "#3357FF",
      comment: "",
      groupId: collaborationGroup.id,
    }).id;

    const commentingID = controls.addCode({
      name: "Commenting & Memoing",
      color: "#F1C40F",
      comment: "",
      groupId: collaborationGroup.id,
    }).id;

    const aiSuggestionsID = controls.addCode({
      name: "AI Suggestions",
      color: "#9B59B6",
      comment: "",
      groupId: aiGroup.id,
    }).id;

    const sentimentID = controls.addCode({
      name: "Sentiment Detection",
      color: "#E67E22",
      comment: "",
      groupId: aiGroup.id,
    }).id;

    const darkModeID = controls.addCode({
      name: "Dark Mode Request",
      color: "#1ABC9C",
      comment: "",
      groupId: uxGroup.id,
    }).id;

    const crashesID = controls.addCode({
      name: "Crash Issues",
      color: "#2ECC71",
      comment: "",
      groupId: uxGroup.id,
    }).id;

    const uploadFlexID = controls.addCode({
      name: "Upload Flexibility",
      color: "#E74C3C",
      comment: "",
      groupId: uxGroup.id,
    }).id;

    // Create text nodes with interview content
    const node1 = controls.addTextNode();
    controls.updateNode(node1.id, {
      label: "Interview - Dr. Miriam",
      text: `<p><strong>Dr. Miriam Osei, Qualitative Researcher and Educator</strong></p><p><strong>Q1: What features do you value most in a Web-based QDA platform?</strong><br>As someone who mentors students regularly, <mark class="theme-mark" data-theme-id="[&quot;${easeOfUseID}&quot;]" data-theme-color="[&quot;#FF5733&quot;]" style="--theme-gradient: #FF5733;">ease of use is my number one priority</mark>. If the software has a steep learning curve, it gets in the way of real analysis. The platform should feel intuitive. I also appreciate when <mark class="theme-mark" data-theme-id="[&quot;${teamCodingID}&quot;]" data-theme-color="[&quot;#3357FF&quot;]" style="--theme-gradient: #3357FF;">the interface encourages collaboration and teamwork</mark>, especially when coding complex group interviews.</p><p><strong>Q2: How has your team used QDA software during the pandemic?</strong><br>Before COVID, we used desktop software in the lab. But when lockdowns hit, we had to switch to a cloud-based tool. <mark class="theme-mark" data-theme-id="[&quot;${teamCodingID}&quot;]" data-theme-color="[&quot;#3357FF&quot;]" style="--theme-gradient: #3357FF;">The ability to upload transcripts, code collaboratively, and review each other's memos in real-time</mark> really helped us stay productive. <mark class="theme-mark" data-theme-id="[&quot;${commentingID}&quot;]" data-theme-color="[&quot;#F1C40F&quot;]" style="--theme-gradient: #F1C40F;">One particular benefit was version control — we could see who coded what, and when.</mark></p><p><strong>Q3: Are there any frustrations you've encountered with existing QDA tools?</strong><br>Definitely. Some platforms still treat the Web version like a lite edition. <mark class="theme-mark" data-theme-id="[&quot;${uploadFlexID}&quot;]" data-theme-color="[&quot;#E74C3C&quot;]" style="--theme-gradient: #E74C3C;">Limited functions, no team tools, and worst of all — no export options</mark>. If you're working on a grant-funded project with strict ethics requirements, this can be a nightmare.</p>`,
      x: 714.9448210697144,
      y: 30.952550103518433,
      width: 400,
      height: 200,
    });

    const node2 = controls.addTextNode();
    controls.updateNode(node2.id, {
      label: "Interview - Tariq",
      text: `<p><strong>Tariq M., PhD Candidate in Sociology</strong></p><p><strong>Q1: Why did you choose to use a Web-based QDA app for your thesis?</strong><br>My university provides licenses for desktop QDA tools, but I needed to <mark class="theme-mark" data-theme-id="[&quot;${crossPlatformID}&quot;]" data-theme-color="[&quot;#33FF57&quot;]" style="--theme-gradient: #33FF57;">analyze interview data across three continents</mark>. <mark class="theme-mark" data-theme-id="[&quot;${teamCodingID}&quot;,&quot;${easeOfUseID}&quot;]" data-theme-color="[&quot;#3357FF&quot;,&quot;#FF5733&quot;]" style="--theme-gradient: #3357FF 0% 50%, #FF5733 50% 100%;">A browser-based app allowed my collaborators to contribute from wherever they were</mark>, no installs needed.</p><p><strong>Q2: What were your main uses for the app?</strong><br>Coding in-vivo themes, creating memos, and linking patterns across interviews. I also loved how easy it was to tag and re-tag excerpts. <mark class="theme-mark" data-theme-id="[&quot;${commentingID}&quot;]" data-theme-color="[&quot;#F1C40F&quot;]" style="--theme-gradient: #F1C40F;">One feature I appreciated was the ability to create code groups visually.</mark></p><p><strong>Q3: Any improvements you'd like to see?</strong><br>It would be great to have <mark class="theme-mark" data-theme-id="[&quot;${sentimentID}&quot;]" data-theme-color="[&quot;#E67E22&quot;]" style="--theme-gradient: #E67E22;">sentiment detection or light NLP features</mark> — <mark class="theme-mark" data-theme-id="[&quot;${aiSuggestionsID}&quot;]" data-theme-color="[&quot;#9B59B6&quot;]" style="--theme-gradient: #9B59B6;">something that suggests potential codes based on frequency or tone</mark>. Not to automate the process, but to assist.</p>`,
      x: 103.05800684931512,
      y: 24.67588007708946,
      width: 400,
      height: 200,
    });

    const node3 = controls.addTextNode();
    controls.updateNode(node3.id, {
      label: "Interview 3",
      text: `<p><strong>Dr. Lina Zhang, Health Services Researcher</strong></p><p><strong>Q1: How do you use Web QDA in your clinical research projects?</strong><br>We conduct interviews with patients and providers. We transcribe and upload them directly. <mark class="theme-mark" data-theme-id="[&quot;${teamCodingID}&quot;]" data-theme-color="[&quot;#3357FF&quot;]" style="--theme-gradient: #3357FF;">The Web app lets our team annotate together, even across time zones.</mark></p><p><strong>Q2: What's your take on AI-powered tools within QDA?</strong><br>I see potential, but also risk. <mark class="theme-mark" data-theme-id="[&quot;${aiSuggestionsID}&quot;]" data-theme-color="[&quot;#9B59B6&quot;]" style="--theme-gradient: #9B59B6;">AI can help surface keywords or cluster themes</mark>, which is great. But we must never lose sight of the human researcher's lens. <mark class="theme-mark" data-theme-id="[&quot;${commentingID}&quot;]" data-theme-color="[&quot;#F1C40F&quot;]" style="--theme-gradient: #F1C40F;">Coding isn't just tagging text — it's interpreting lived experience.</mark></p><p><strong>Q3: Favorite feature so far?</strong><br><mark class="theme-mark" data-theme-id="[&quot;${commentingID}&quot;]" data-theme-color="[&quot;#F1C40F&quot;]" style="--theme-gradient: #F1C40F;">The way the app allows direct linking between quotes, codes, and notes</mark> — it makes the analysis much more fluid. We even used it to build out sections of our report directly from the excerpts.</p>`,
      x: 701.1951258811207,
      y: 542.6462537394546,
      width: 400,
      height: 200,
    });

    const node4 = controls.addTextNode();
    controls.updateNode(node4.id, {
      label: "Survey",
      text: `<p><strong>User 1:</strong><br><mark class="theme-mark" data-theme-id="[&quot;${easeOfUseID}&quot;]" data-theme-color="[&quot;#FF5733&quot;]" style="--theme-gradient: #FF5733;">The Web app is smooth and clean</mark>. I like the ability to highlight and code just by dragging. <mark class="theme-mark" data-theme-id="[&quot;${darkModeID}&quot;]" data-theme-color="[&quot;#1ABC9C&quot;]" style="--theme-gradient: #1ABC9C;">Please add a dark mode for night work!</mark></p><p><strong>User 2:</strong><br><mark class="theme-mark" data-theme-id="[&quot;${crashesID}&quot;]" data-theme-color="[&quot;#2ECC71&quot;]" style="--theme-gradient: #2ECC71;">It crashed when I tried to upload a .docx file</mark>. PDF worked fine though. <mark class="theme-mark" data-theme-id="[&quot;${easeOfUseID}&quot;]" data-theme-color="[&quot;#FF5733&quot;]" style="--theme-gradient: #FF5733;">Love the color coding system — it's easier to manage than my old system of sticky notes.</mark></p><p><strong>User 3:</strong><br><mark class="theme-mark" data-theme-id="[&quot;${teamCodingID}&quot;]" data-theme-color="[&quot;#3357FF&quot;]" style="--theme-gradient: #3357FF;">Super helpful for team coding</mark>. We had 4 people on a focus group transcript and we could comment on each other's excerpts.</p><p><strong>User 4:</strong><br><mark class="theme-mark" data-theme-id="[&quot;${commentingID}&quot;]" data-theme-color="[&quot;#F1C40F&quot;]" style="--theme-gradient: #F1C40F;">Would be helpful to add in-app voice memos or even short video clips for reflexive journaling</mark>. Just an idea!</p>`,
      x: 72.64968629399334,
      y: 512.158797653689,
      width: 400,
      height: 200,
    });

    // Reset view to show all nodes
    controls.resetView();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        tooltip="Debug"
        tooltipSide="bottom"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bug size={18} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            dragMomentum={false}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="absolute top-20 right-4 w-80 max-h-[calc(100vh-6rem)] bg-background/95 border border-border rounded-lg shadow-lg overflow-hidden backdrop-blur-sm z-50"
          >
            <div className="p-4 border-b border-border flex items-center cursor-grab">
              <h3 className="font-semibold">Debug Panel</h3>
              <Button
                variant="outline"
                className="absolute right-4 top-4 rounded-sm size-6"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={createDemoProject}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Create Demo Project
                </Button>
                {isMultiplayer ? (
                  <MultiplayerDebug />
                ) : (
                  <>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Viewport</h4>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto select-text">
                        {JSON.stringify(canvas.viewport, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Nodes</h4>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto select-text">
                        {JSON.stringify(canvas.nodes, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Codes</h4>
                      <pre className="text-xs bg-muted p-2 rounded select-text">
                        {JSON.stringify(canvas.codes, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Code Groups</h4>
                      <pre className="text-xs bg-muted p-2 rounded select-text">
                        {JSON.stringify(canvas.codeGroups, null, 2)}
                      </pre>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
