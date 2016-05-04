using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace eMAC.Infra.Domain
{
    class XMLLoader
    {
        public string LoadMessageFromXML(string xmlFile, string rootNode, string filterCode, string filterValue, string dataCode)
        {

            //XmlUrlResolver resolver;
            XmlDocument sourceDocument;
            XmlNodeList nodeList;
            string result = "";
            sourceDocument = new XmlDocument();
            sourceDocument.Load(xmlFile);
            nodeList = sourceDocument.SelectNodes(rootNode);

            foreach (XmlNode node in nodeList)
            {
                string code = node.Attributes.GetNamedItem(filterCode).Value;
                if (code == filterValue)
                {
                    string value = node.Attributes.GetNamedItem(dataCode).Value;
                    result = value;
                    break;
                };
            }

            return result;
        }
    }
}
