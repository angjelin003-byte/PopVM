import docx

doc = docx.Document()
doc.add_heading('Repository Specification Document: pop!os', 0)

doc.add_heading('1. Metadata & Target Paths', level=1)
table = doc.add_table(rows=1, cols=2)
hdr = table.rows[0].cells
hdr[0].text, hdr[1].text = 'Variable', 'Specification'
data = [
    ('Repository Name', 'pop!os'),
    ('Configuration Filename', 'pop!os.sources'),
    ('Target File Path', '/etc/apt/sources.list.d/pop!os.sources'),
    ('Keyring Path', '/usr/share/keyrings/pop!os-archive-keyring.gpg'),
]
for var, spec in data:
    row = table.add_row().cells
    row[0].text, row[1].text = var, spec

doc.save('pop!os_spec.docx')
