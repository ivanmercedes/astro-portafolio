import { useState } from "react";
import FormConfig from "./FormConfig";
import ScriptOutput from "./ScriptOutput";

function App() {
  const [script, setScript] = useState("");

  const generateScript = (config) => {
    const script = `
# =============== CONFIGURACIÓN DEL SERVIDOR ===============
# 1. Configurar IP estática
New-NetIPAddress -InterfaceAlias "${config.interface}" -IPAddress ${
      config.ip
    } -PrefixLength ${config.subnet} -DefaultGateway ${config.gateway}
Set-DnsClientServerAddress -InterfaceAlias "${
      config.interface
    }" -ServerAddresses ("${config.dns1}", "${config.dns2}")

# 2. Cambiar nombre del servidor
Rename-Computer -NewName "${config.hostname}" -Force

# 3. Instalar roles (AD, DNS${config.dhcp ? ", DHCP" : ""})
Install-WindowsFeature AD-Domain-Services, DNS${
      config.dhcp ? ", DHCP" : ""
    } -IncludeManagementTools

# 4. Promover a controlador de dominio
Install-ADDSForest 
    -DomainName "${config.domain}" 
    -DomainNetbiosName "${config.netbios}" 
    -InstallDns:$true 
    -SafeModeAdministratorPassword (ConvertTo-SecureString "${
      config.safePass
    }" -AsPlainText -Force) 
    -Force:$true

# 5. Crear usuario
New-ADUser -Name "${config.userName}" -SamAccountName "${config.userLogin}" 
    -AccountPassword (ConvertTo-SecureString "${
      config.userPass
    }" -AsPlainText -Force) 
    -Enabled $true

${
  config.dhcp
    ? `
# 6. Configurar DHCP
Add-DhcpServerv4Scope -Name "Red_${config.netbios}" -StartRange ${config.dhcpStart} -EndRange ${config.dhcpEnd} -SubnetMask 255.255.255.0
Set-DhcpServerv4OptionValue -DnsServer ${config.ip} -Router ${config.gateway}
`
    : ""
}

# Script generado automáticamente - ${new Date().toLocaleString()}
    `;
    setScript(script.trim());
  };

  return (
    <div className="container mx-auto max-w-screen-lg px-6 relative z-10 py-10">
      <div className="grid grid-cols-1  gap-8">
        <FormConfig onSubmit={generateScript} />
        <ScriptOutput script={script} />
      </div>
    </div>
  );
}

export default App;
