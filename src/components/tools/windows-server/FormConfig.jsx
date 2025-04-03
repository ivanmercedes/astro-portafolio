import { Button, Input } from "@nextui-org/react";
import { useState } from "react";

const initialConfig = {
  hostname: "PEPE-DONIS01",
  ip: "192.168.1.10",
  subnet: "24",
  gateway: "192.168.1.1",
  dns1: "192.168.1.10",
  dns2: "8.8.8.8",
  interface: "Ethernet0",
  domain: "empresa.local",
  netbios: "EMPRESA",
  safePass: "P@ssw0rd123",
  userName: "Admin Dominio",
  userLogin: "admin",
  userPass: "P@ssw0rd123",
  dhcp: true,
  dhcpStart: "192.168.1.100",
  dhcpEnd: "192.168.1.200",
};

export default function FormConfig({ onSubmit }) {
  const [config, setConfig] = useState(initialConfig);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig({
      ...config,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(config);
  };

  return (
    <div className="bg-background/70 backdrop-blur-lg   border border-background/90 p-3 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-300 mb-6">
        Configuración del Servidor
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Hostname"
            type="text"
            name="hostname"
            value={config.hostname}
            onChange={handleChange}
            required
          />

          <Input
            label="Interfaz de Red"
            type="text"
            name="interface"
            value={config.interface}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="IP"
            type="text"
            name="ip"
            value={config.ip}
            onChange={handleChange}
            required
          />

          <Input
            label="Máscara (/24)"
            type="text"
            name="subnet"
            value={config.subnet}
            onChange={handleChange}
            required
          />
          <Input
            label="Gateway"
            type="text"
            name="gateway"
            value={config.gateway}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="DNS Primario"
            type="text"
            name="dns1"
            value={config.dns1}
            onChange={handleChange}
            required
          />

          <Input
            label="DNS Secundario"
            type="text"
            name="dns2"
            value={config.dns2}
            onChange={handleChange}
            required
          />
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold text-gray-300 mb-3">
            Configuración de Dominio
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Dominio"
              type="text"
              name="domain"
              value={config.domain}
              onChange={handleChange}
              required
            />
            <Input
              label="NetBIOS"
              type="text"
              name="netbios"
              value={config.netbios}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mt-4">
            <Input
              label="Contraseña Modo Seguro"
              type="password"
              name="safePass"
              value={config.safePass}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold text-gray-300 mb-3">
            Usuario del Dominio
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Nombre Completo"
              type="text"
              name="userName"
              value={config.userName}
              onChange={handleChange}
              required
            />
            <Input
              label="Usuario"
              type="text"
              name="userLogin"
              value={config.userLogin}
              onChange={handleChange}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              name="userPass"
              value={config.userPass}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              name="dhcp"
              checked={config.dhcp}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label className="ml-2 text-sm font-medium text-gray-300">
              Habilitar DHCP
            </label>
          </div>

          {config.dhcp && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Rango DHCP"
                type="text"
                name="dhcpRange"
                value={`${config.dhcpStart} - ${config.dhcpEnd}`}
                onChange={handleChange}
                required
              />
              <Input
                label="Inicio Rango DHCP"
                type="text"
                name="dhcpStart"
                value={config.dhcpStart}
                onChange={handleChange}
                required
              />
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="bg-gradient-to-tr from-blue-500 to-purple-500 text-white shadow-lg w-full"
          radius="full"
        >
          Generar Script
        </Button>
      </form>
    </div>
  );
}
