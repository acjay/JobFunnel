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
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
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
  opportunitiesOrdered,
  eventsByOpportunityId,
  tasksDatabaseId,
  eventsDatabaseId,
}: {
  opportunitiesByStatus: Record<string, Opportunity[]>;
  opportunitiesOrdered: Opportunity[];
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

  function onDragEnd(result: DropResult) {
    // Dropped outside the list
    if (!result.destination) {
      console.log(`Dropped card outside the list`, result);
      return;
    }

    const sourceStatus = result.source.droppableId;
    const destinationStatus = result.destination.droppableId;
    const soureIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const opportunityId = result.draggableId;

    const opportunity = opportunitiesOrdered.find(
      (o) => o.id === opportunityId
    );

    if (!opportunity) {
      console.error(
        `Could not find opportunity with id ${opportunityId} in the ordered opportunities`
      );
      return;
    }

    if (sourceStatus === destinationStatus && soureIndex === destinationIndex) {
      console.log("No change");
      return;
    }

    // if (result.source.index === result.destination.index) {
    //   return;
    // }

    // We want to calculate an ordering key that puts the moved opportunity
    // between the adjacent opportunities in the destination status. But,
    // this could collide with an ordering key outside the destination status,
    // if these opportunities are not adjacent in the global ordering.
    // So, we'll place it halfway between the previous opportunity and the next
    // opportunity in the global ordering, which will have an ordering key
    // less than or equal to that of the next opportunity in the destination
    // status.

    const prevOpportunityInStatus =
      opportunitiesByStatus[destinationStatus]?.[destinationIndex - 1];
    const nextOpportunityInStatus =
      opportunitiesByStatus[destinationStatus]?.[destinationIndex];
    const prevOpportunity =
      prevOpportunityInStatus ??
      opportunitiesOrdered[
        opportunitiesOrdered.findIndex(
          (o) => o.id === nextOpportunityInStatus.id
        ) - 1
      ];
    const prevOpportunityIndex = opportunitiesOrdered.findIndex(
      (o) => o.id === prevOpportunity?.id
    );
    const nextOpportunity = opportunitiesOrdered[prevOpportunityIndex + 1];

    const prevOrderingKey =
      prevOpportunity?.orderingKey ?? opportunitiesOrdered[0].orderingKey - 1;

    const nextOrderingKey =
      nextOpportunity?.orderingKey ??
      opportunitiesOrdered[opportunitiesOrdered.length - 1].orderingKey + 1;
    const newOrderingKey = (prevOrderingKey + nextOrderingKey) / 2;

    console.log({
      opportunity,
      destinationStatus,
      prevOpportunity,
      prevOpportunityInStatus,
      nextOpportunity,
      nextOpportunityInStatus,
      prevOrderingKey,
      nextOrderingKey,
      newOrderingKey,
    });

    // Reorder the opportunity in the database
    // const insertAfterIndex = console.log(
    //   `Move opportunity ${opportunityId} from ${sourceStatus} to ${destinationStatus}`
    // );
  }

  return (
    <section className="overflow-scroll">
      <h2>Opportunities</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-3">
          {ORDERED_STATUSES.map((status) => (
            <div key={status}>
              <div className="flex justify-between mb-2 p-1">
                <h3 className="text-">{status}</h3>
                <span className="text-xs">
                  {opportunitiesByStatus[status]?.length ?? 0}
                </span>
              </div>
              <Droppable droppableId={status}>
                {({ innerRef, droppableProps, placeholder }) => (
                  <div
                    className="w-[300px] space-y-2"
                    ref={innerRef}
                    {...droppableProps}
                  >
                    {opportunitiesByStatus[status]?.map(
                      (opportunity, opportunityIdx) => {
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
                          <div key={opportunity.id}>
                            <Draggable
                              draggableId={opportunity.id}
                              index={opportunityIdx}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <Card
                                    // key={opportunity.id}
                                    className="rounded-md p-1"
                                  >
                                    <CardHeader className="flex p-1">
                                      <img
                                        src={logoUrl}
                                        alt={logoAlt}
                                        className="w-10 h-10 rounded-md border-gray-900 border-1"
                                      />
                                      <div className="grow ml-2">
                                        <div className="text-sm font-semibold">
                                          {opportunity.name}
                                        </div>
                                        <div className="text-xs">
                                          {opportunity.title}
                                        </div>
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
                                        events={
                                          eventsByOpportunityId[
                                            opportunity.id
                                          ] ?? []
                                        }
                                        now={now}
                                      />
                                    </CardBody>
                                  </Card>
                                </div>
                              )}
                            </Draggable>
                          </div>
                        );
                      }
                    )}
                    {placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
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
