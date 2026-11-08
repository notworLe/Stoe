# Quét bí mật
```bash
git ls-files | grep -E "\.env$"          # không được có file .env nào
git log --all --oneline -- '*.env' '.env*'        # lịch sử không từng commit .env
git grep -nIE "sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}|BEGIN (RSA |OPENSSH )?PRIVATE KEY" $(git rev-list --all) | head

```