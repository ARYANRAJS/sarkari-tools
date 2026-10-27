/* ═══════════════════════════════════════════════════
   JSON TO XML & XML TO JSON CONVERTER
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  let currentMode = 'json_to_xml'; // or 'xml_to_json'

  const tabJsonToXml = document.getElementById('tabJsonToXml');
  const tabXmlToJson = document.getElementById('tabXmlToJson');
  const rootTagWrapper = document.getElementById('rootTagWrapper');
  const rootTagName = document.getElementById('rootTagName');
  const srcLabel = document.getElementById('srcLabel');
  const destLabel = document.getElementById('destLabel');
  const srcInput = document.getElementById('srcInput');
  const destOutput = document.getElementById('destOutput');
  const srcStats = document.getElementById('srcStats');
  const destStats = document.getElementById('destStats');
  const btnConvert = document.getElementById('btnConvert');
  const btnSample = document.getElementById('btnSample');
  const btnClear = document.getElementById('btnClear');
  const btnCopyResult = document.getElementById('btnCopyResult');
  const btnDownloadResult = document.getElementById('btnDownloadResult');

  // JSON to XML
  function jsonToXml(obj, rootName = 'root', indent = '  ', depth = 0) {
    const pad = indent.repeat(depth);
    let xml = '';

    if (depth === 0) {
      xml += `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n`;
      depth++;
    }

    const currentPad = indent.repeat(depth);

    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        if (typeof item === 'object' && item !== null) {
          xml += `${currentPad}<item>\n`;
          for (const key in item) {
            xml += buildXmlNode(key, item[key], indent, depth + 1);
          }
          xml += `${currentPad}</item>\n`;
        } else {
          xml += `${currentPad}<item>${escapeXml(item)}</item>\n`;
        }
      });
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        xml += buildXmlNode(key, obj[key], indent, depth);
      }
    }

    if (depth === 1) {
      xml += `</${rootName}>`;
    }

    return xml;
  }

  function buildXmlNode(key, val, indent, depth) {
    const pad = indent.repeat(depth);
    const cleanKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');

    if (val === null || val === undefined) {
      return `${pad}<${cleanKey}/>\n`;
    }

    if (Array.isArray(val)) {
      let sub = '';
      val.forEach((item) => {
        if (typeof item === 'object' && item !== null) {
          sub += `${pad}<${cleanKey}>\n`;
          for (const k in item) {
            sub += buildXmlNode(k, item[k], indent, depth + 1);
          }
          sub += `${pad}</${cleanKey}>\n`;
        } else {
          sub += `${pad}<${cleanKey}>${escapeXml(item)}</${cleanKey}>\n`;
        }
      });
      return sub;
    }

    if (typeof val === 'object') {
      let sub = `${pad}<${cleanKey}>\n`;
      for (const k in val) {
        sub += buildXmlNode(k, val[k], indent, depth + 1);
      }
      sub += `${pad}</${cleanKey}>\n`;
      return sub;
    }

    return `${pad}<${cleanKey}>${escapeXml(val)}</${cleanKey}>\n`;
  }

  function escapeXml(unsafe) {
    if (typeof unsafe !== 'string') unsafe = String(unsafe);
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // XML to JSON
  function xmlToJson(xmlStr) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlStr, 'text/xml');

    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error(parserError.textContent.slice(0, 150));
    }

    function xmlNodeToObject(node) {
      if (node.nodeType === 3) {
        return node.nodeValue.trim();
      }

      const obj = {};

      if (node.hasAttributes()) {
        obj['@attributes'] = {};
        for (let j = 0; j < node.attributes.length; j++) {
          const attr = node.attributes.item(j);
          obj['@attributes'][attr.nodeName] = attr.nodeValue;
        }
      }

      if (node.hasChildNodes()) {
        const textNodes = Array.from(node.childNodes).filter((n) => n.nodeType === 3 && n.nodeValue.trim());
        const elementNodes = Array.from(node.childNodes).filter((n) => n.nodeType === 1);

        if (elementNodes.length === 0 && textNodes.length > 0) {
          return textNodes[0].nodeValue.trim();
        }

        elementNodes.forEach((child) => {
          const nodeName = child.nodeName;
          const childObj = xmlNodeToObject(child);

          if (obj[nodeName] === undefined) {
            obj[nodeName] = childObj;
          } else {
            if (!Array.isArray(obj[nodeName])) {
              obj[nodeName] = [obj[nodeName]];
            }
            obj[nodeName].push(childObj);
          }
        });
      }

      return obj;
    }

    const root = xmlDoc.documentElement;
    const result = {};
    result[root.nodeName] = xmlNodeToObject(root);
    return JSON.stringify(result, null, 2);
  }

  function executeConversion() {
    const raw = srcInput.value.trim();
    srcStats.textContent = `${raw.length} chars`;

    if (!raw) {
      destOutput.value = '';
      destStats.textContent = '0 chars';
      return;
    }

    try {
      if (currentMode === 'json_to_xml') {
        const parsed = JSON.parse(raw);
        const root = rootTagName.value.trim() || 'root';
        const xml = jsonToXml(parsed, root);
        destOutput.value = xml;
        destStats.textContent = `${xml.length} chars`;
      } else {
        const json = xmlToJson(raw);
        destOutput.value = json;
        destStats.textContent = `${json.length} chars`;
      }
    } catch (err) {
      destOutput.value = `⚠️ Error during conversion:\n${err.message}`;
      destStats.textContent = 'Conversion failed';
    }
  }

  // Switch modes
  tabJsonToXml.addEventListener('click', () => {
    currentMode = 'json_to_xml';
    tabJsonToXml.className = 'btn btn-primary';
    tabXmlToJson.className = 'btn btn-outline';
    rootTagWrapper.style.display = 'flex';
    srcLabel.textContent = 'Input JSON:';
    destLabel.textContent = 'Converted XML:';
    srcInput.placeholder = 'Paste JSON here...';
    srcInput.value = samples.json;
    executeConversion();
  });

  tabXmlToJson.addEventListener('click', () => {
    currentMode = 'xml_to_json';
    tabXmlToJson.className = 'btn btn-primary';
    tabJsonToXml.className = 'btn btn-outline';
    rootTagWrapper.style.display = 'none';
    srcLabel.textContent = 'Input XML:';
    destLabel.textContent = 'Converted JSON:';
    srcInput.placeholder = 'Paste XML here...';
    srcInput.value = samples.xml;
    executeConversion();
  });

  const samples = {
    json: '{\n  "company": "AllToolsInOne",\n  "active": true,\n  "year": 2026,\n  "tools": [\n    {"id": 1, "name": "Image Resizer", "category": "Image"},\n    {"id": 2, "name": "Word Counter", "category": "Daily"}\n  ]\n}',
    xml: '<?xml version="1.0" encoding="UTF-8"?>\n<company>\n  <name>AllToolsInOne</name>\n  <active>true</active>\n  <year>2026</year>\n  <tools>\n    <item>\n      <id>1</id>\n      <name>Image Resizer</name>\n    </item>\n    <item>\n      <id>2</id>\n      <name>Word Counter</name>\n    </item>\n  </tools>\n</company>'
  };

  btnConvert.addEventListener('click', executeConversion);
  srcInput.addEventListener('input', executeConversion);

  btnSample.addEventListener('click', () => {
    srcInput.value = currentMode === 'json_to_xml' ? samples.json : samples.xml;
    executeConversion();
  });

  btnClear.addEventListener('click', () => {
    srcInput.value = '';
    destOutput.value = '';
    srcStats.textContent = '0 chars';
    destStats.textContent = '0 chars';
  });

  btnCopyResult.addEventListener('click', () => {
    if (!destOutput.value || destOutput.value.startsWith('⚠️')) return;
    navigator.clipboard.writeText(destOutput.value).then(() => {
      const orig = btnCopyResult.innerHTML;
      btnCopyResult.innerHTML = '✅ Copied!';
      setTimeout(() => { btnCopyResult.innerHTML = orig; }, 1800);
    });
  });

  btnDownloadResult.addEventListener('click', () => {
    if (!destOutput.value || destOutput.value.startsWith('⚠️')) return;
    const ext = currentMode === 'json_to_xml' ? 'xml' : 'json';
    const mime = currentMode === 'json_to_xml' ? 'application/xml' : 'application/json';
    const blob = new Blob([destOutput.value], { type: `${mime};charset=utf-8` });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `converted_data.${ext}`;
    a.click();
  });

  // Initial
  srcInput.value = samples.json;
  executeConversion();

})();
