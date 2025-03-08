"use client";
import React, { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "../ui/animated-modal";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";



export function CreateRoomModal() {

  const [roomId, setRoomId] = useState<string>('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId) {
      // Redirect to /room/[id] where [id] is the roomId entered by the user
      router.push(`/game/${roomId}`);
    }
  };

 
  return (
    <div className="py-40  flex items-center justify-center">
      <Modal>
        <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center group/modal-btn">
          <span className="group-hover/modal-btn:translate-x-40 text-center transition duration-500">
            Join Room
          </span>
          <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
            🚀
          </div>
        </ModalTrigger>
        <ModalBody>
          <ModalContent>
            
            <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
              Enter to our{" "}
              <span className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 border border-gray-200">
                Metaverse
              </span>{" "}
              now! 🚀
            </h4>
            
            <div className="py-10 flex flex-col gap-x-3 gap-y-6 items-center justify-center max-w-sm mx-auto">
            <h1 className="text-neutral-400">⚠️ test room id = 123</h1>
            <Input type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)} className="p-1 w-fit"  placeholder="Enter Room Id"/>
            </div>
          </ModalContent>
          <ModalFooter className="gap-4">
            <button className="px-2 py-1 bg-gray-200 text-black dark:bg-black dark:border-black dark:text-white border border-gray-300 rounded-md text-sm w-28">
              Cancel
            </button>
            <button onClick={handleSubmit} className="bg-black text-white dark:bg-white dark:text-black text-sm px-2 py-1 rounded-md border border-black w-28">
              Book Now
            </button>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </div>
  );
}

