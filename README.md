# ThreatGraph

A modern, interactive threat modeling and data flow diagram (DFD) tool built with Next.js and React Flow. ThreatGraph enables security professionals and developers to create visual threat models, analyze security risks, and identify potential vulnerabilities using the STRIDE methodology.

## 🚀 Features

### Interactive Threat Modeling Canvas
- **Drag & Drop Interface**: Intuitive visual editor for creating threat models
- **Multiple Node Types**: 
  - **Entities**: External actors, users, systems, and APIs
  - **Processes**: Application components and business logic
  - **Data Stores**: Databases, file systems, and storage components
  - **Trust Boundaries/Zones**: Security perimeters and network segments
- **Data Flow Connections**: Visual representation of data movement between components

### Built-in Security Templates
- **Cloud Providers**: Pre-configured templates for AWS, Azure, GCP services
- **Authentication Systems**: OAuth2, SAML, and other auth mechanisms  
- **Common Components**: APIs, databases, web servers, mobile clients, CI/CD systems
- **File Types**: Various document and data formats
- **Network Components**: Load balancers, proxies, firewalls

### Automated Threat Analysis
- **STRIDE Framework**: Systematic threat identification using Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, and Elevation of Privilege
- **Rule-Based Analysis**: Configurable security rules for automated threat detection
- **Real-time Results**: Instant feedback on potential security risks as you design
- **Compliance Mapping**: Links threats to CWE, OWASP, and other security frameworks

### Modern UI/UX
- **Responsive Design**: Works seamlessly across desktop and tablet devices
- **Dark/Light Mode Support**: Comfortable viewing in any environment
- **Properties Panel**: Detailed configuration for selected elements
- **Layers Panel**: Hierarchical view of diagram components
- **Threats Panel**: Comprehensive list of identified security risks

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Diagramming**: @xyflow/react (React Flow)
- **UI Components**: Radix UI, Tailwind CSS
- **Data Processing**: YAML parsing, JSON Schema validation
- **Icons**: Lucide React, React Icons

## 📋 Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zonezone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Creating Your First Threat Model

1. **Add Components**: Drag elements from the left toolbar onto the canvas
   - Use **Entity** nodes for external users, systems, or APIs
   - Use **Process** nodes for application logic and services
   - Use **Data Store** nodes for databases and file storage
   - Use **Zone** nodes to define trust boundaries

2. **Connect Components**: Click and drag between nodes to create data flows
   - Connections represent how data moves through your system
   - Each connection can have processes attached to it

3. **Configure Properties**: Select any element to view and edit its properties
   - Set names, descriptions, and security attributes
   - Configure element-specific settings

4. **Run Threat Analysis**: Click the play button to analyze your model
   - View identified threats in the Threats panel
   - Each threat includes severity, description, and mitigation strategies

### Built-in Templates

ThreatGraph includes comprehensive templates organized by category:

- **Cloud Services**: AWS Lambda, S3, RDS, Azure Functions, GCP services
- **Authentication**: OAuth2 providers, SAML, multi-factor authentication
- **Databases**: SQL, NoSQL, graph databases, caching systems
- **Network**: Load balancers, API gateways, CDNs, firewalls
- **Clients**: Web browsers, mobile apps, desktop applications

### Keyboard Shortcuts

- `Cmd/Ctrl + A`: Select all elements
- `Cmd/Ctrl + C`: Copy selected elements (coming soon)
- `Cmd/Ctrl + V`: Paste elements (coming soon)

## 🔧 Configuration

### Custom Templates

You can extend ThreatGraph with custom templates by adding YAML files to the `src/built-in/` directory:

- `element/`: Node templates for entities, processes, and data stores
- `rule/`: Security analysis rules
- `threat/`: Threat definitions with STRIDE mappings

### Rule Schema

Security rules follow this structure:
```yaml
- id: <uuid>
  threat: <threat-uuid>
  element: zone|entity|datastore|process|dataflow
  designs: 
    # Define conditions using design patterns
```

For detailed rule writing guidelines, see [docs/RULE.md](docs/RULE.md).

### Threat Schema

Threats are defined with comprehensive metadata:
```yaml
- id: <uuid>
  name: "Threat Name"
  severity: high|medium|low|informative|critical
  description: "Detailed threat description"
  mitigation: "Recommended countermeasures"
  compliance:
    cwe: ["CWE-XXX"]
    owasp: ["A01:2021"]
    stride: ["Spoofing", "Tampering"]
```

For comprehensive threat definition guidelines, see [docs/THREAT.md](docs/THREAT.md).

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── components/        # React components
│   │   ├── Canvas.tsx     # Main diagramming canvas
│   │   ├── nodes/         # Node type components
│   │   └── panels/        # UI panels (properties, threats, etc.)
│   └── page.tsx          # Main application page
├── built-in/             # Built-in templates and rules
│   ├── element/          # Node templates
│   ├── rule/             # Analysis rules
│   └── threat/           # Threat definitions
├── DFD/                  # Data flow diagram core logic
├── components/ui/        # Reusable UI components
├── draw/                 # Canvas utilities
└── parser/               # Template and rule parsing
docs/                     # Documentation
├── RULE.md              # Rule writing guide
└── THREAT.md            # Threat definition guide
```

## 🧪 Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Adding New Node Types

1. Create a new component in `src/app/components/nodes/`
2. Register it in `ElementNodes` in `ElementNode.tsx`
3. Add corresponding schema in `src/DFD/`
4. Update templates in `src/built-in/element/`

### Creating Custom Rules

1. Add YAML rule files to `src/built-in/rule/`
2. Define conditions that trigger the rule
3. Specify which threats to associate with matches
4. Test with the built-in analyzer

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Resources

- [STRIDE Threat Modeling](https://docs.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats)
- [OWASP Threat Modeling](https://owasp.org/www-community/Threat_Modeling)
- [React Flow Documentation](https://reactflow.dev/)
- [Next.js Documentation](https://nextjs.org/docs)

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page for known problems
2. Create a new issue with detailed information
3. Join our community discussions

---

**ThreatGraph** - Making threat modeling accessible, visual, and collaborative.
