import {
  Button,
  Code,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect } from "react";

export default function ScriptOutput({ script }) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const copyToClipboard = () => {
    navigator.clipboard.writeText(script);
    onClose();
  };

  useEffect(() => {
    console.log(script);
    if (script) {
      onOpen();
    }
  }, [script]);

  return (
    <div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1"></ModalHeader>
              <ModalBody>
                <Code color="default">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {script ||
                      "Completa el formulario y haz clic en 'Generar Script'"}
                  </pre>
                </Code>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
                <Button color="primary" onPress={() => copyToClipboard()}>
                  Copiar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
