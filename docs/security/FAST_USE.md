# Quét bí mật
```bash
git ls-files | grep -E "\.env$"          # không được có file .env nào
git log --all --oneline -- .env          # lịch sử không từng commit .env
git grep -iE "api_key|secret|password|token" $(git rev-list --all) | head
```