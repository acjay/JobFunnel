import {
  Accordion,
  AccordionItem,
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import { Opportunity, OpportunityEvent } from "../lib/models";
import { useState } from "react";
import { addEvent as addEventAction } from "../actions";
import { formatDistance } from "date-fns";

const ORDERED_STATUSES = [
  "Not started",
  "Prioritized",
  "Contacted",
  "Application submitted",
  "Intro scheduled",
  "Interviews scheduled",
  "Awaiting decision",
  "Closed",
];

export const Opportunities = ({
  opportunitiesByStatus,
  eventsByOpportunityId,
  tasksDatabaseId,
  eventsDatabaseId,
}: {
  opportunitiesByStatus: Record<string, Opportunity[]>;
  eventsByOpportunityId: Record<string, OpportunityEvent[]>;
  tasksDatabaseId: string;
  eventsDatabaseId: string;
}) => {
  const [addEventModalIsOpen, setAddEventModalIsOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);

  const now = new Date();

  function onCardMenuAction(
    action: React.Key,
    selectedOpportunity: Opportunity
  ) {
    switch (action) {
      case "add_event":
        setSelectedOpportunity(selectedOpportunity);
        setAddEventModalIsOpen(true);
        break;
      case "add_task":
        alert("Add task for " + selectedOpportunity.name);
        break;
      case "edit_fields":
        alert("Edit fields for " + selectedOpportunity.name);
        break;
      default:
        break;
    }
  }

  return (
    <section className="overflow-scroll">
      <ScrollShadow orientation="horizontal">
        <ScrollShadow orientation="vertical">
          <h2>Opportunities</h2>
          <div className="flex space-x-3">
            {ORDERED_STATUSES.map((status) => (
              <div key={status}>
                <div className="flex justify-between mb-2 p-1">
                  <h3 className="text-">{status}</h3>
                  <span className="text-xs">
                    {opportunitiesByStatus[status]?.length ?? 0}
                  </span>
                </div>

                <div className="w-[300px] space-y-2">
                  {opportunitiesByStatus[status]?.map((opportunity) => {
                    const logoUrl =
                      opportunity.type === "Connection"
                        ? "/Generic_friend_style_2.png"
                        : opportunity.logoDomain
                        ? `https://logo.clearbit.com/${opportunity.logoDomain}`
                        : "/Generic_company_style_2.png";
                    const logoAlt = opportunity.logoDomain
                      ? `${opportunity.name} logo`
                      : "Generic logo";
                    return (
                      <Card key={opportunity.id} className="rounded-md p-1">
                        <CardHeader className="flex p-1">
                          <img
                            src={logoUrl}
                            alt={logoAlt}
                            className="w-10 h-10 rounded-md border-gray-900 border-1"
                          />
                          {/* <Avatar
                            isBordered
                            className="rounded"
                            src={logoUrl}
                            alt={logoAlt}
                          /> */}
                          <div className="grow ml-2">
                            <div className="text-sm font-semibold">
                              {opportunity.name}
                            </div>
                            <div className="text-xs">{opportunity.title}</div>
                          </div>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button
                                isIconOnly
                                variant="bordered"
                                size="sm"
                                className="shrink rounded-md p-0"
                              >
                                …
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                              aria-label="Static Actions"
                              onAction={(key) =>
                                onCardMenuAction(key, opportunity)
                              }
                            >
                              <DropdownItem key="add_event">
                                Add Event
                              </DropdownItem>
                              <DropdownItem key="add_task">
                                Add Task
                              </DropdownItem>
                              <DropdownItem key="edit_fields">
                                Edit Fields
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </CardHeader>
                        <Divider />
                        <CardBody className="p-1">
                          <p>Lorem ipsum</p>
                          <OpportunityEvents
                            events={eventsByOpportunityId[opportunity.id] ?? []}
                            now={now}
                          />
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollShadow>
      </ScrollShadow>
      <AddEventModal
        isOpen={addEventModalIsOpen}
        selectedOpportunity={selectedOpportunity}
        eventDatabaseId={eventsDatabaseId}
        onOpenChange={(isOpen) => setAddEventModalIsOpen(isOpen)}
      />
    </section>
  );
};

function OpportunityEvents({
  events,
  now,
}: {
  events: OpportunityEvent[];
  now: Date;
}) {
  return (
    <Accordion isCompact className="px-0" itemClasses={{ title: "text-xs" }}>
      <AccordionItem key="1" aria-label="Events" title="Events">
        <div className="max-h-64 overflow-y-scroll space-y-2">
          {events.map((event) => (
            <div key={event.id}>
              <Tooltip
                content={
                  event.timestamp.toLocaleDateString() +
                  " " +
                  event.timestamp.toLocaleTimeString()
                }
                placement="top-start"
                showArrow={true}
                color="secondary"
              >
                <div className="text-xs text-slate-500 italic">
                  {formatDistance(event.timestamp, now)}
                </div>
              </Tooltip>
              <div className="text-sm">{event.description}</div>
            </div>
          ))}
        </div>
      </AccordionItem>
    </Accordion>
  );
}

function AddEventModal({
  isOpen,
  selectedOpportunity,
  eventDatabaseId,
  onOpenChange,
}: {
  isOpen: boolean;
  selectedOpportunity: Opportunity | null;
  eventDatabaseId: string;
  onOpenChange: (open: boolean) => void;
}) {
  const [description, setDescription] = useState("");

  const titleName = selectedOpportunity
    ? selectedOpportunity.name +
      (selectedOpportunity.title ? ` - ${selectedOpportunity.title}` : "")
    : "<no opportunity selected>";

  async function persistEvent(onClose: () => void) {
    if (selectedOpportunity) {
      const result = await addEventAction(
        eventDatabaseId,
        selectedOpportunity,
        description,
        new Date()
      );
      console.log("persistEvent result", result);
    } else {
      alert("Somehow, selectedOpportunity is null. This should not happen.");
    }
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <form action={() => persistEvent(onClose)}>
            <ModalHeader className="flex flex-col gap-1">
              Add Event for {titleName}
            </ModalHeader>
            <ModalBody>
              <Input
                type="text"
                label="Description"
                value={description}
                onValueChange={setDescription}
              />
            </ModalBody>
            <ModalFooter>
              <Button type="submit" color="primary">
                Confirm
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
